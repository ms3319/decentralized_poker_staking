const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions")

const StakeStatus = {
    Requested: 0,
    Filled: 1,
    Expired: 2,
    Cancelled: 3,
    AwaitingReturnPayment: 4,
    Completed: 5,
    EscrowReturned: 6
};

const GameType = {
    SingleGame: 0,
    Tournament: 1
};

contract("Staking", (accounts) => {
    let staking;
    let ownerAccount = accounts[0];
    let horseAccount1 = accounts[1];
    let backerAccount1 = accounts[2];
    let horseAccount2 = accounts[3];

    beforeEach(async () => {
        staking = await Staking.new({from: ownerAccount});
    });

    afterEach(async () => {
        await staking.kill({from: ownerAccount});
    });

    describe("Creating Players", async () => {
        it("Create a new player", async () => {
            await staking.createPlayer("api id", "John Smith", "www.sharkscope.com", "www.images.com/pic", {from: horseAccount1});
            
            let player = await staking.getPlayer(horseAccount1);
            assert.equal(player.apiId, "api id", "Player API id doesn't match");
            assert.equal(player.name, "John Smith", "Player name doesn't match");
            assert.equal(player.sharkscopeLink, "www.sharkscope.com", "Player sharkscope link doesn't match");
            assert.equal(player.profilePicPath, "www.images.com/pic", "Player profile pic path doesn't match");
            assert.equal(player.stakeIds.length, 0, "Player hasn't created any stakes");
        });
    });

    describe("Creating Stakes", async () => {
        it("Create a new stake with valid arguments", async () => {
            await staking.createRequest(1000, 45, 0, GameType.SingleGame, "secret_id", {from: horseAccount1});

            let stake = await staking.getStake(0);
            assert.equal(stake.amount, 1000, "Stake amount doesn't match");
            assert.equal(stake.profitShare, 45, "Stake profit share doesn't match");
            assert.equal(stake.escrow, 0, "Stake escrow doesn't match");
            assert.equal(stake.status, StakeStatus.Requested, "Stake escrow doesn't match");
            assert.equal(stake.gameType, GameType.SingleGame, "Stake game type doesn't match");
            assert.equal(stake.apiId, "secret_id", "Stake apiId doesn't match");
        });

        it("Create a new escrow stake with valid arguments", async () => {
            await staking.createRequest(1000, 45, 1000, GameType.Tournament, "secret_id", {from: horseAccount1, value: 1000});

            let stake = await staking.getStake(0);
            assert.equal(stake.amount, 1000, "Stake amount doesn't match");
            assert.equal(stake.profitShare, 45, "Stake profit share doesn't match");
            assert.equal(stake.escrow, 1000, "Stake escrow doesn't match");
            assert.equal(stake.status, StakeStatus.Requested, "Stake escrow doesn't match");
            assert.equal(stake.gameType, GameType.Tournament, "Stake game type doesn't match");
            assert.equal(stake.apiId, "secret_id", "Stake apiId doesn't match");
        });

        it("Cannot create a new escrow stake with msg.value != escrow", async () => {
            await truffleAssert.reverts(staking.createRequest(1000, 45, 1000, GameType.Tournament, "secret_id", {from: horseAccount1, value: 800}));
        });

        it("Cannot create a new stake with invalid profit share", async () => {
            await truffleAssert.reverts(staking.createRequest(1000, 150, 0, GameType.Tournament, "secret_id", {from: horseAccount1}));
        });

        it("Stake created by a player is associated with them", async () => {
            await staking.createPlayer("api id", "John Smith", "www.sharkscope.com", "www.images.com/pic", {from: horseAccount1});
            let player = await staking.getPlayer(horseAccount1);
            assert.equal(player.stakeIds.length, 0, "Player hasn't created any stakes");

            await staking.createRequest(1000, 45, 0,GameType.SingleGame, "secret_id",  {from: horseAccount1});
            player = await staking.getPlayer(horseAccount1);
            let stake = await staking.getStake(player.stakeIds[0]);

            assert.equal(player.stakeIds.length, 1, "Player has created a stake");
            assert.equal(stake.amount, 1000, "Stake amount doesn't match");
            assert.equal(stake.horse, horseAccount1, "The stake's horse doesn't match")

            player = await staking.getPlayer(stake.horse);
            assert.equal(player.name, "John Smith", "Player name doesn't match");
        });

        it("Player stakes can be modified via the global stake map", async () => {
            await staking.createPlayer("api id", "John Smith", "www.sharkscope.com", "www.images.com/pic", {from: horseAccount1});
            await staking.createRequest(1000, 45, 0, GameType.Tournament, "secret_id", {from: horseAccount1});
            await staking.createRequest(2000, 45, 0, GameType.Tournament, "secret_id", {from: horseAccount1});

            await staking.stakeHorse(1, {from: backerAccount1, value: 2000});

            let player = await staking.getPlayer(horseAccount1);
            assert.equal(player.stakeIds.length, 2, "Both stakes did not get associated with the player")

            let stake0 = await staking.getStake(player.stakeIds[0]);
            let stake1 = await staking.getStake(player.stakeIds[1]);
            assert.equal(stake0.status, StakeStatus.Requested, "Stake status was changed from Requested");
            assert.equal(stake1.status, StakeStatus.Filled, "Stake status not updated to Filled");
        });
    });

    describe("Cancelling Standard Stakes", async () => {
        beforeEach("Create new non-escrow stake", async () => {
            await staking.createRequest(1000, 45, 0, GameType.Tournament, "secret_id", {from: horseAccount1});
        });

        it("Horse can cancel requested stake", async () => {
            await staking.cancelStakeAsHorse(0, {from: horseAccount1});
            let stake = await staking.getStake(0);

            assert.equal(stake.status, StakeStatus.Cancelled, "Stake status was not updated");
        });

        it("Cannot cancel non-existent stake", async () => {
            await truffleAssert.reverts(staking.cancelStakeAsHorse(123, {from: horseAccount1}));
        });

        it("Non-horse cannot cancel requested stake", async () => {
            await truffleAssert.reverts(staking.cancelStakeAsHorse(0, {from: backerAccount1}));
        });

        it("Can only cancel a requested stake (not filled/cancelled)", async () => {
            await staking.cancelStakeAsHorse(0, {from: horseAccount1});
            await truffleAssert.reverts(staking.cancelStakeAsHorse(0, {from: horseAccount1}));
        });
    });

    describe("Cancelling Escrow Stakes", async () => {
        beforeEach("Create new escrow stake", async () => {
            await staking.createRequest(1000, 45, 1000, GameType.Tournament, "secret_id", {from: horseAccount1, value: 1000});
        });

        // TODO: Find out if you can get transfers that happen inside smart contract function calls
        // it("Cancelling returns escrow deposit", async () => {
        //     let tx = await staking.cancelStakeAsHorse(0, {from: horseAccount1});
        //     console.log(tx);
        // });
    });

    describe("Filling Stakes", async () => {
        beforeEach("Create new non-escrow stake", async () => {
            await staking.createRequest(1000, 45, 0, GameType.Tournament, "secret_id", {from: horseAccount1});
        });

        it("Stake a horse with valid args", async () => {
            await staking.stakeHorse(0, {from: backerAccount1, value: 1000});
            let stake = await staking.getStake(0);
            assert.equal(stake.status, StakeStatus.Filled, "Stake status not updated to filled");
        });

        it("Cannot stake a horse with incorrect value", async () => {
            await truffleAssert.reverts(staking.stakeHorse(0, {from: backerAccount1, value: 1200}));
            let stake = await staking.getStake(0);
            assert.equal(stake.status, StakeStatus.Requested, "Stake status updated to filled when it should still be requested");
        });

        it("Cannot stake a request that doesn't exist", async () => {
            await truffleAssert.reverts(staking.stakeHorse(123, {from: backerAccount1, value: 1200}));
        });

        it("Cannot stake a request that has already been staked", async () => {
            await staking.stakeHorse(0, {from: backerAccount1, value: 1000});
            await truffleAssert.reverts(staking.stakeHorse(0, {from: backerAccount1, value: 1200}));
        });

        it("Cannot stake a request that has been cancelled", async () => {
            await staking.cancelStakeAsHorse(0, {from: horseAccount1});
            await truffleAssert.reverts(staking.stakeHorse(0, {from: backerAccount1, value: 1200}));
        });
    });

    describe("Returning Profits", async () => {
        beforeEach("Create new non-escrow stake", async () => {
            await staking.createRequest(1000, 45, 0, GameType.Tournament, "secret_id", {from: horseAccount1});
        });

        it("Cannot return profits of a requested stake", async () => {
            await truffleAssert.reverts(staking.returnProfits(0, {from: backerAccount1, value: 1200}));
        });

        it("Can return profits of an awaiting return payment stake", async () => {
            await staking.stakeHorse(0, {from: backerAccount1, value: 1000});
            await staking.gamePlayed(0, 3000);
            await staking.returnProfits(0, {from: horseAccount1, value: 3000});
            let stake = await staking.getStake(0);
            assert.equal(stake.profit, 3000, "Stake profit not updated");
            assert.equal(stake.status, StakeStatus.Completed, "Stake status not updated to completed");
        });

        it("Only the horse can return profits", async () => {
            await truffleAssert.reverts(staking.returnProfits(0, {from: backerAccount1, value: 1200}));
        });
    });

    describe("Requesting back escrow", async () => {
        beforeEach("Create new escrow and non-escrow stakes", async () => {
            await staking.createRequest(1000, 45, 0, GameType.SingleGame, "some_id", {from: horseAccount1});
            await staking.createRequest(500, 62, 250, GameType.Tournament, "another_id", {from: horseAccount2, value: 250});
        });

        it("Cannot return escrow from a non-completed stake", async () => {
            await truffleAssert.reverts(staking.requestEscrow(0, {from: backerAccount1}));
        });

        it("Cannot return escrow from a non-escrow stake", async () => {
            await staking.stakeHorse(0, {from: backerAccount1, value: 1000});
            await staking.gamePlayed(0, 1000);
            await truffleAssert.reverts(staking.requestEscrow(0, {from: backerAccount1}));
        });

        it("Cannot return escrow to non-backer", async () => {
            await staking.stakeHorse(1, {from: backerAccount1, value: 500});
            await staking.gamePlayed(1, 1000, {from: ownerAccount});
            await truffleAssert.reverts(staking.requestEscrow(1, {from: horseAccount1}));
        });

        it("Can return escrow to backer when awaiting return payment", async () => {
            await staking.stakeHorse(1, {from: backerAccount1, value: 500});
            await staking.gamePlayed(1, 1000, {from: ownerAccount});
            await staking.requestEscrow(1, {from: backerAccount1});

            let stake = await staking.getStake(1);
            assert.equal(stake.status, StakeStatus.EscrowReturned);
        });
    });
});
