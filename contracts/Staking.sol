// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Staking {
    uint public requestCount = 0;
    mapping(uint => Stake) public stakes;
    address payable public owner;

    mapping(address => Player) public players;

    enum StakeStatus {
        Requested,
        Filled,
        Expired, // TODO: When will we use this
        Cancelled,
        AwaitingReturnPayment,
        Completed,
        EscrowClaimed,
        PartiallyFilled
    }

    enum GameType {
        SingleGame,
        Tournament
    }

    struct Stake {
        uint id;
        address payable horse;
        address payable[] backers;
        uint[] investments;
        uint amount;
        uint filled_amount;
        uint escrow;
        uint profitShare;
        int pnl;
        uint backerReturns;
        StakeStatus status;
        GameType gameType;
        string apiId;
        StakeTimeStamp stakeTimeStamp;
    }

    struct StakeTimeStamp {
        uint256 createdTimestamp;
        uint256 lastFilledTimestamp;
        uint256 gamePlayedTimestamp;
    }

    struct Player {
        address payable playerAddress;
        string apiId;
        string name;
        string sharkscopeLink;
        string profilePicPath;
        uint[] stakeIds; // stakes where the player is the horse.
        uint256 createdTimestamp;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    event PlayerCreated(address playerAddress, string apiId, string name, string sharkscopeLink, string profilePicPath);

    /// A player with this address already exists
    error PlayerAlreadyExists(address playerAddress);

    function createPlayer(string memory apiId, string memory name, string memory sharkscopeLink, string memory profilePicPath) external payable {
        if (players[msg.sender].playerAddress != address(0)) {
            revert PlayerAlreadyExists(msg.sender);
        }
        players[msg.sender].apiId = apiId;
        players[msg.sender].playerAddress = payable(msg.sender);
        players[msg.sender].name = name;
        players[msg.sender].sharkscopeLink = sharkscopeLink;
        players[msg.sender].profilePicPath = profilePicPath;
        players[msg.sender].createdTimestamp = block.timestamp;

        emit PlayerCreated(msg.sender, apiId, name, sharkscopeLink, profilePicPath);
    }

    function getPlayer(address add) external view returns (Player memory) {
        return players[add];
    }

    // player doesn't exist
    error PlayerDoesntExist(address playerAddress);

    event PlayerEdited(address playerAddress);

    function editPlayer(string memory name, string memory sharkscopeLink, string memory profilePicPath) external {
        if (players[msg.sender].playerAddress == address(0)) {
            emit PlayerEdited(msg.sender);
            revert PlayerDoesntExist(msg.sender);
        }

        players[msg.sender].name = name;
        players[msg.sender].sharkscopeLink = sharkscopeLink;
        players[msg.sender].profilePicPath = profilePicPath;

        emit PlayerEdited(msg.sender);
    }

    /// Only the owner can kill this contract
    error OnlyOwnerCanKill();

    function kill() external {
        if (msg.sender != owner) {
            revert OnlyOwnerCanKill();
        }
        selfdestruct(owner);
    }

    // Get an individual stake

    /// Not a valid id for a stake request
    error InvalidStakeId(uint id);

    function getStake(uint id) external view returns (Stake memory) {
        if (!validId(id)) {
            revert InvalidStakeId(id);
        }

        return stakes[id];
    }

    // Creating a new stake request
    event StakeRequested(address horse, uint amount, uint escrow);

    /// Profit share must be between 0 and 100
    error InvalidProfitShare(uint profitShare);
    /// Escrow does not match msg.value
    error EscrowValueNotMatching(uint escrow, uint value);

    function createRequest(uint amount, uint profitShare, uint escrow, GameType gameType, string memory apiId) external payable {
        if (profitShare > 100) {
            revert InvalidProfitShare(profitShare);
        }
        if (escrow > 0 && escrow != msg.value) {
            revert EscrowValueNotMatching(escrow, msg.value);
        }
        StakeTimeStamp memory stakeTimeStamp = StakeTimeStamp(block.timestamp, 0, 0);
        stakes[requestCount].id = requestCount;
        stakes[requestCount].horse = payable(msg.sender);
        stakes[requestCount].amount = amount;
        stakes[requestCount].filled_amount = 0;
        stakes[requestCount].escrow = escrow;
        stakes[requestCount].profitShare = profitShare;
        stakes[requestCount].status = StakeStatus.Requested;
        stakes[requestCount].gameType = gameType;
        stakes[requestCount].apiId = apiId;
        stakes[requestCount].stakeTimeStamp = stakeTimeStamp;

        players[msg.sender].stakeIds.push(requestCount);
        requestCount++;

        emit StakeRequested(msg.sender, amount, escrow);
    }

    // Staking a request
    event StakeFilled(Stake stake);
    
    /// Stake has already been filled/cancelled
    error StakeNotFillable(uint id);
    /// You cannot stake yourself
    error StakingSelf(uint id, address horse, address backer);
    /// Cannot stake more than the remaining amount
    error StakedMoreThanRemaining(uint id, uint stakedAmount, uint remainingAmount);
    /// Staked amount and msg value do not match
    error ValueAndAmountDoNotMatch(uint amount, uint value);
   
    function stakeHorse(uint id, uint amount) external payable {
        // require(validId(id), "This is not a valid ID for a stake!");
        if (id >= requestCount) {
            revert InvalidStakeId(id);
        }
    
        Stake storage stake = stakes[id];
        if (stake.status != StakeStatus.Requested || stake.status != StakeStatus.PartiallyFilled) {
            revert StakeNotFillable(id);
        }

        address payable horse = stake.horse;
        address payable backer = payable(msg.sender);
        if (horse == backer) {
            revert StakingSelf(id, horse, backer);
        }
        
        if (msg.value != amount) {
            revert ValueAndAmountDoNotMatch(amount, msg.value);
        }

        if (amount + stake.filled_amount > stake.amount) {
            revert StakedMoreThanRemaining(id, amount, stake.amount - stake.filled_amount);
        }

        // Update stake status and transfer funds
        stake.filled_amount += amount;
        if (stake.filled_amount == stake.amount) {
            stake.status = StakeStatus.Filled;
            horse.transfer(stake.amount); // Only send the investment once completely filled
        } else {
            stake.status = StakeStatus.PartiallyFilled;
        }
        stake.backers.push(payable(backer));
        stake.investments.push(amount);
        stake.stakeTimeStamp.lastFilledTimestamp = block.timestamp;

        stakes[id] = stake;
        emit StakeFilled(stake);
    }

    // Cancelling a reqested stake
    event StakeCancelled(uint id);
    
    /// Only the horse can cancel a requested stake
    error CancellingSenderIsNotHorse(uint id, address canceller, address horse);
    /// A horse can only cancel a stake when it has only been requested
    error StakeIsNotCancellable(uint id, StakeStatus status);

    function cancelStakeAsHorse(uint id) external {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }
        Stake memory stake = stakes[id];
        
        if (msg.sender != stake.horse) {
            revert CancellingSenderIsNotHorse(id, msg.sender, stake.horse);
        }
        
        if (stake.status != StakeStatus.Requested) {
            revert StakeIsNotCancellable(id, stake.status);
        }

        if (stake.escrow > 0) {
            stake.horse.transfer(stake.escrow);
        }
        stake.status = StakeStatus.Cancelled;

        stakes[id] = stake;
        emit StakeCancelled(id);
    }
    

    // Returning profits to backer after completing games
    event ProfitsReturned(uint id, uint backerReturns);
    
    /// Only the horse can return the profits from a stake
    error ReturningProfitsSenderIsNotHorse(uint id, address sender, address horse);
    /// Profits can only be returned if a stake has been filled
    error StakeProfitNotReturnable(uint id, StakeStatus status);
    /// Message value not equal to the profit returns of the backer
    error MessageValueNotEqualToBackerReturns(uint value, uint backerReturns);
    
    function returnProfits(uint id) external payable {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }
        Stake storage stake = stakes[id];

        if (msg.sender != stake.horse) {
            revert ReturningProfitsSenderIsNotHorse(id, msg.sender, stake.horse);
        }
        
        if (stake.status != StakeStatus.AwaitingReturnPayment) {
            revert StakeProfitNotReturnable(id, stake.status);
        }

        // TODO: See above before we can do this
        // if (msg.value != backerReturns) {
        //     revert MessageValueNotEqualToBackerReturns(msg.value, backerReturns);
        // }
        for (uint i = 0; i < stake.backers.length; i++) {
            stake.backers[i].transfer((stake.backerReturns * stake.amount) / stake.investments[i]);
        }
        if (stake.escrow > 0) {
            stake.horse.transfer(stake.escrow);
        }
        stake.status = StakeStatus.Completed;

        stakes[id] = stake;
        emit ProfitsReturned(id, stake.backerReturns);
    }


    // Setting the status of a stake to AwaitingReturnPayment

    event GamePlayed(uint id, int pnl, uint backerReturns);

    /// You can only complete a game after it has been filled
    error CanOnlyPlayedFilledStakes(uint id, StakeStatus status);

    function gamePlayed(uint id, int pnl) external {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }

        if (stakes[id].status != StakeStatus.Filled) {
            revert CanOnlyPlayedFilledStakes(id, stakes[id].status);
        }

        // TODO: Check this calculation. Do we do it here or calculate it in the frontend?
        uint backerReturns;
        if (pnl < 0) {
            int owed = int(stakes[id].amount) + pnl;
            if (owed <= 0) {
                backerReturns = 0;
                stakes[id].status = StakeStatus.Completed;
            } else {
                backerReturns = uint(owed);
                stakes[id].status = StakeStatus.AwaitingReturnPayment;
            }
        } else {
            backerReturns = stakes[id].amount + ((uint(pnl) * stakes[id].profitShare) / 100);
            stakes[id].status = StakeStatus.AwaitingReturnPayment;
        }

        stakes[id].pnl = pnl;
        stakes[id].backerReturns = backerReturns;
        stakes[id].stakeTimeStamp.gamePlayedTimestamp = block.timestamp;
        emit GamePlayed(id, pnl, backerReturns);
    }


    // Requesting back your escrow while awaiting return payment
    event EscrowClaimed(uint id, uint escrow, address backer);

    /// You can only request your escrow back when the status of the stake is awaiting return payment
    error CanOnlyReturnEscrowWhenAwaitingReturnPayment(uint id, StakeStatus status);
    /// Only the stake backer can request the contract's escrow
    error OnlyBackerCanRequestEscrow(uint id, address sender);
    /// Cannot return back escrow for a stake which never had an escrow put up
    error CannotReturnNoEscrow(uint id, uint escrow);

    // TODO: Only allow this when the state is actually AwaitingReturnPaymentClaimEscrow
    function backerClaimEscrow(uint id) external {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }
        if (stakes[id].status != StakeStatus.AwaitingReturnPayment) {
            revert CanOnlyReturnEscrowWhenAwaitingReturnPayment(id, stakes[id].status);
        }

        if (stakes[id].escrow == 0) {
            revert CannotReturnNoEscrow(id, stakes[id].escrow);
        }

        bool isBacker = false;
        for (uint i = 0; i < stakes[id].backers.length; i++) {
            if (msg.sender == stakes[id].backers[i]) {
                isBacker = true;
                stakes[id].backers[i].transfer((stakes[id].escrow * stakes[id].amount) / stakes[id].investments[i]);
            }
        }
        if (!isBacker) {
            revert OnlyBackerCanRequestEscrow(id, msg.sender);
        }

        stakes[id].status = StakeStatus.EscrowClaimed;
        emit EscrowClaimed(id, stakes[id].escrow, msg.sender);
    }

    function validId(uint id) internal view returns (bool) {
        return id < requestCount;
    }



}