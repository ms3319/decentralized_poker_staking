const Staking = artifacts.require("Staking");
const truffleAssert = require("truffle-assertions")

const StakeStatus = {
    Requested: 0,
    Filled: 1,
    Expired: 2,
    Cancelled: 3,
    AwaitingReturnPayment: 4,
    Completed: 5
};

contract("Staking", (accounts) => {
    let staking;
    let ownerAccount = accounts[0];
    let horseAccount1 = accounts[1];
    let backerAccount1 = accounts[2];

    beforeEach(async () => {
        staking = await Staking.new({from: ownerAccount});
    });

    afterEach(async () => {
        await staking.kill({from: ownerAccount});
    });

    describe("Creating Stakes", async () => {
        it("Create a new stake with valid arguments", async () => {
            await staking.createRequest(1000, 45, 0, {from: horseAccount1});

            let stake = await staking.getStake(0);
            assert.equal(stake.amount, 1000, "Stake amount doesn't match");
            assert.equal(stake.profitShare, 45, "Stake profit share doesn't match");
            assert.equal(stake.escrow, 0, "Stake escrow doesn't match");
            assert.equal(stake.status, StakeStatus.Requested, "Stake escrow doesn't match");
        });

        it("Create a new escrow stake with valid arguments", async () => {
            await staking.createRequest(1000, 45, 1000, {from: horseAccount1, value: 1000});

            let stake = await staking.getStake(0);
            assert.equal(stake.amount, 1000, "Stake amount doesn't match");
            assert.equal(stake.profitShare, 45, "Stake profit share doesn't match");
            assert.equal(stake.escrow, 1000, "Stake escrow doesn't match");
            assert.equal(stake.status, StakeStatus.Requested, "Stake escrow doesn't match");
        });

        it("Cannot create a new escrow stake with msg.value != escrow", async () => {
            await truffleAssert.reverts(staking.createRequest(1000, 45, 1000, {from: horseAccount1, value: 800}));
        });

        it("Cannot create a new stake with invalid profit share", async () => {
            await truffleAssert.reverts(staking.createRequest(1000, 150, 0, {from: horseAccount1}));
        });
    });

    describe("Cancelling Standard Stakes", async () => {
        beforeEach("Create new non-escrow stake", async () => {
            await staking.createRequest(1000, 45, 0, {from: horseAccount1});
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
            await staking.createRequest(1000, 45, 1000, {from: horseAccount1, value: 1000});
        });

        // TODO: Find out if you can get transfers that happen inside smart contract function calls
        // it("Cancelling returns escrow deposit", async () => {
        //     let tx = await staking.cancelStakeAsHorse(0, {from: horseAccount1});
        //     console.log(tx);
        // });
    });

    describe("Filling Stakes", async () => {
        beforeEach("Create new non-escrow stake", async () => {
            await staking.createRequest(1000, 45, 0, {from: horseAccount1});
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
            await staking.createRequest(1000, 45, 0, {from: horseAccount1});
        });

        it("Cannot return profits of a requested stake", async () => {
            await truffleAssert.reverts(staking.returnProfits(0, 1200, {from: backerAccount1, value: 1200}));
        });

        it("Can return profits of a filled stake", async () => {
            await staking.stakeHorse(0, {from: backerAccount1, value: 1000});
            await staking.returnProfits(0, 3000, {from: horseAccount1, value: 3000});
            let stake = await staking.getStake(0);
            assert.equal(stake.profit, 3000, "Stake profit not updated");
            assert.equal(stake.status, StakeStatus.Completed, "Stake status not updated to completed");
        });

        it("Only the horse can return profits", async () => {
            await truffleAssert.reverts(staking.returnProfits(0, 1200, {from: backerAccount1, value: 1200}));
        });
    });
});
