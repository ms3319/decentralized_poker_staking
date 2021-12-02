// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Dai or StakeCoin (production or development)
interface Token {
    function transfer(address dst, uint amount) external returns (bool);
    function transferFrom(address src, address dst, uint amount) external returns (bool);
    function balanceOf(address guy) external view returns (uint);
    function approve(address spender, uint amount) external returns (bool);
}

contract Staking {
    Token public token;
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

    struct InvestmentDetails {
        address payable[] backers;
        uint[] investments;
        uint[] backerReturns;
        uint filledAmount;
        uint playThreshold;
    }

    struct Stake {
        uint id;
        address payable horse;
        InvestmentDetails investmentDetails;
        uint amount;
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
        uint256 scheduledForTimestamp;
    }

    struct Player {
        address payable playerAddress;
        string apiId;
        string name;
        string sharkscopeLink;
        string profilePicPath;
        uint[] stakeIds; // stakes where the player is the horse.
        uint256 createdTimestamp;
        bool canCreateStake; // False when they have a stake that is awaiting repayment
    }

    constructor(address tokenAddress) {
        owner = payable(msg.sender);
        token = Token(tokenAddress);
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
        players[msg.sender].canCreateStake = true;

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
    event StakeRequested(Stake stake);

    /// Profit share must be between 0 and 100
    error InvalidProfitShare(uint profitShare);
    /// Escrow does not match msg.value
    error EscrowValueNotMatching(uint escrow, uint value);
    /// Player has not registered
    error PlayerDoesNotExist(address sender);
    /// Player is locked from creating new stakes. Return awaiting payments first.
    error PlayerNotAllowedToCreateStake(address player);

    function createRequest(uint amount, uint profitShare, uint escrow, uint playThreshold, GameType gameType, string memory apiId, uint256 scheduledFor) external payable {
        if (players[msg.sender].playerAddress == address(0)) {
            revert PlayerDoesNotExist(msg.sender);
        }
        if (!players[msg.sender].canCreateStake) {
            revert PlayerNotAllowedToCreateStake(msg.sender);
        }
        if (profitShare > 100) {
            revert InvalidProfitShare(profitShare);
        }
        if (escrow > 0) {
            token.transferFrom(msg.sender, address(this), escrow);
        }

        StakeTimeStamp memory stakeTimeStamp = StakeTimeStamp(block.timestamp, 0, 0, scheduledFor);
        InvestmentDetails memory investmentDetails;
        investmentDetails.playThreshold = playThreshold;

        stakes[requestCount].id = requestCount;
        stakes[requestCount].horse = payable(msg.sender);
        stakes[requestCount].amount = amount;
        stakes[requestCount].investmentDetails.filledAmount = 0;
        stakes[requestCount].investmentDetails = investmentDetails;
        stakes[requestCount].escrow = escrow;
        stakes[requestCount].profitShare = profitShare;
        stakes[requestCount].status = StakeStatus.Requested;
        stakes[requestCount].gameType = gameType;
        stakes[requestCount].apiId = apiId;
        stakes[requestCount].stakeTimeStamp = stakeTimeStamp;

        players[msg.sender].stakeIds.push(requestCount);
        requestCount++;

        emit StakeRequested(stakes[requestCount - 1]);
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
//         require(validId(id), "This is not a valid ID for a stake!");
        if (id >= requestCount) {
            revert InvalidStakeId(id);
        }
    
        Stake storage stake = stakes[id];
        if (stake.status != StakeStatus.Requested && stake.status != StakeStatus.PartiallyFilled) {
            revert StakeNotFillable(id);
        }

        address payable horse = stake.horse;
        address payable backer = payable(msg.sender);
        if (horse == backer) {
            revert StakingSelf(id, horse, backer);
        }
//        if (msg.value != amount) {
//            revert ValueAndAmountDoNotMatch(amount, msg.value);
//        }

        if (amount + stake.investmentDetails.filledAmount > stake.amount) {
            revert StakedMoreThanRemaining(id, amount, stake.amount - stake.investmentDetails.filledAmount);
        }

        bool passedThresholdBefore = stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold;
        stake.status = StakeStatus.PartiallyFilled;
        // Update stake status and transfer funds
        stake.investmentDetails.filledAmount += amount;
        if (stake.investmentDetails.filledAmount == stake.amount) {
            stake.status = StakeStatus.Filled;
        }
        if (!passedThresholdBefore && stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold) {
            // Just passed the threshold - send money pool to horse
            token.transferFrom(msg.sender, address(this), amount);
            token.transfer(stake.horse, stake.investmentDetails.filledAmount);
        } else if (stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold) {
            // We have already passed the threshold - send money directly to horse
            token.transferFrom(msg.sender, stake.horse, amount);
        } else {
            // We are still below the threshold - add to money pool
            token.transferFrom(msg.sender, address(this), amount);
        }
        stake.investmentDetails.backers.push(payable(backer));
        stake.investmentDetails.investments.push(amount);
        stake.investmentDetails.backerReturns.push(0);
        stake.stakeTimeStamp.lastFilledTimestamp = block.timestamp;

        stakes[id] = stake;
        emit StakeFilled(stake);
    }
    
    event MultipleStakesFilled(uint count);
    error NoStakesSelected(address backer);

    function stakeMultipleGamesOnHorse(uint[] calldata ids, uint[] calldata amounts) external payable {
        if (ids.length < 1) {
            revert NoStakesSelected(msg.sender);
        }
        
        address payable backer = payable(msg.sender);
        address payable horse = stakes[0].horse;
        
        for (uint i = 0; i < ids.length; i++) {
            uint id = ids[i];
            if (id >= requestCount) {
                revert InvalidStakeId(id);
            }
        
            Stake storage stake = stakes[id];
            if (stake.status != StakeStatus.Requested && stake.status != StakeStatus.PartiallyFilled) {
                revert StakeNotFillable(id);
            }

            if (horse == backer) {
                revert StakingSelf(id, horse, backer);
            }
            uint amount = amounts[i];

            if (amount + stake.investmentDetails.filledAmount > stake.amount) {
                revert StakedMoreThanRemaining(id, amount, stake.amount - stake.investmentDetails.filledAmount);
            }

            bool passedThresholdBefore = stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold;
            stake.status = StakeStatus.PartiallyFilled;
            // Update stake status and transfer funds
            stake.investmentDetails.filledAmount += amount;
            if (stake.investmentDetails.filledAmount == stake.amount) {
                stake.status = StakeStatus.Filled;
            }
            if (!passedThresholdBefore && stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold) {
                // Just passed the threshold - send money pool to horse
                token.transferFrom(msg.sender, address(this), amount);
                token.transfer(stake.horse, stake.investmentDetails.filledAmount);
            } else if (stake.investmentDetails.filledAmount >= stake.investmentDetails.playThreshold) {
                // We have already passed the threshold - send money directly to horse
                token.transferFrom(msg.sender, stake.horse, amount);
            } else {
                // We are still below the threshold - add to money pool
                token.transferFrom(msg.sender, address(this), amount);
            }
            stake.investmentDetails.backers.push(payable(backer));
            stake.investmentDetails.investments.push(amount);
            stake.investmentDetails.backerReturns.push(0);
            stake.stakeTimeStamp.lastFilledTimestamp = block.timestamp;

            stakes[id] = stake;
            emit StakeFilled(stake);
        }

        emit MultipleStakesFilled(ids.length);
    }

    // Expiring a stake for a game that has been played
    event StakeExpired(uint id);

    // A stake can only be expired if it is status Requested or PartiallyFilled
    error StakeIsNotExpirable(uint id, StakeStatus status);

    // Only the oracle can expire stakes
    //TODO: this!!
    // error OnlyOracleCanExpireStake(uint id, address sender);

    function expireStake(uint id) external {
        if (!validId(id)) {
            revert InvalidStakeId(id);
        }
        Stake memory stake = stakes[id];

        // TODO: This!!
        // if (msg.sender != /*<oracle_address>*/) {
        //     revert OnlyOracleCanExpireStake(id, msg.sender)
        // }

        if (stake.status != StakeStatus.Requested && stake.status != StakeStatus.PartiallyFilled) {
            revert StakeIsNotExpirable(id, stake.status);
        }

        if (stake.status == StakeStatus.PartiallyFilled) {
            for (uint i = 0; i < stake.investmentDetails.backers.length; i++) {
                token.transfer(stake.investmentDetails.backers[i], stake.investmentDetails.investments[i]);
            }
        }

        if (stake.escrow > 0) {
            token.transfer(stake.horse, stake.escrow);
        }

        stake.status = StakeStatus.Expired;
        stakes[id] = stake;
        emit StakeExpired(id);
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
            token.transfer(stake.horse, stake.escrow);
            // stake.horse.transfer(stake.escrow);
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
        for (uint i = 0; i < stake.investmentDetails.backers.length; i++) {
            token.transferFrom(msg.sender, stake.investmentDetails.backers[i], stake.investmentDetails.backerReturns[i]);
        }
        if (stake.escrow > 0) {
            token.transfer(stake.horse, stake.escrow);
            // stake.horse.transfer(stake.escrow);
        }
        stake.status = StakeStatus.Completed;
        players[stake.horse].canCreateStake = true;

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

        if (!(stakes[id].status == StakeStatus.Filled || (stakes[id].status == StakeStatus.PartiallyFilled && stakes[id].investmentDetails.filledAmount >= stakes[id].investmentDetails.playThreshold))) {
            revert CanOnlyPlayedFilledStakes(id, stakes[id].status);
        }

        // TODO: Check this calculation. Do we do it here or calculate it in the frontend?
        uint backerReturns;
        if (pnl < 0) {
            int owed = int(stakes[id].investmentDetails.filledAmount) + pnl;
            if (owed <= 0) {
                backerReturns = 0;
                stakes[id].status = StakeStatus.Completed;
            } else {
                backerReturns = uint(owed);
                stakes[id].status = StakeStatus.AwaitingReturnPayment;
            }
        } else {
            backerReturns = stakes[id].investmentDetails.filledAmount + ((uint(pnl) * stakes[id].profitShare) / 100);
            stakes[id].status = StakeStatus.AwaitingReturnPayment;
        }

        for (uint i = 0; i < stakes[id].investmentDetails.backers.length; i++) {
            stakes[id].investmentDetails.backerReturns[i] = (backerReturns * stakes[id].investmentDetails.investments[i]) / stakes[id].investmentDetails.filledAmount;
        }

        stakes[id].pnl = pnl;
        stakes[id].backerReturns = backerReturns;
        stakes[id].stakeTimeStamp.gamePlayedTimestamp = block.timestamp;
        players[stakes[id].horse].canCreateStake = false;
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
        for (uint i = 0; i < stakes[id].investmentDetails.backers.length; i++) {
            if (msg.sender == stakes[id].investmentDetails.backers[i]) {
                isBacker = true;
                token.transfer(stakes[id].investmentDetails.backers[i], (stakes[id].escrow * stakes[id].investmentDetails.investments[i] / stakes[id].investmentDetails.filledAmount));
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