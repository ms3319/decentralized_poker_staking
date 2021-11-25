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
        EscrowClaimed
    }

    enum GameType {
        SingleGame,
        Tournament
    }

    struct Stake {
        uint id;
        address payable horse;
        address payable backer;
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
        uint256 filledTimestamp;
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
        if (escrow > 0) {
            token.transferFrom(msg.sender, address(this), escrow);
        }
        StakeTimeStamp memory stakeTimeStamp = StakeTimeStamp(block.timestamp, 0, 0);
        stakes[requestCount] = Stake(requestCount, payable(msg.sender), payable(address(0)), amount, escrow, profitShare, 0, 0, StakeStatus.Requested, gameType, apiId, stakeTimeStamp);
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
    /// Message value doesn't match the requested amount
    error ValueDoesNotMatchStakeAmount(uint id, uint value, uint amount);
   
    function stakeHorse(uint id) external payable {
        // require(validId(id), "This is not a valid ID for a stake!");
        if (id >= requestCount) {
            revert InvalidStakeId(id);
        }
    
        Stake memory stake = stakes[id];
        if (stake.status != StakeStatus.Requested) {
            revert StakeNotFillable(id);
        }

        address payable horse = stake.horse;
        address payable backer = payable(msg.sender);
        if (horse == backer) {
            revert StakingSelf(id, horse, backer);
        }
        
        // Update stake status and transfer funds
        stake.status = StakeStatus.Filled;
        stake.backer = backer;
        stake.stakeTimeStamp.filledTimestamp = block.timestamp;
        token.transferFrom(msg.sender, stake.horse, stake.amount);

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
            token.transfer(stake.horse, stake.escrow);
            // stake.horse.transfer(stake.escrow);
        }
        stake.status = StakeStatus.Cancelled;

        stakes[id] = stake;
        emit StakeCancelled(id);
    }
    
    // TODO: How might we allow this?
    
    // function cancelStakeAsBacker(uint id) external payable {
    //     Stake memory stake = stakes[id];
    //     require(msg.sender == stake.backer);
    //     require(validId(id), "This is not a valid ID for a stake!");
    // }

    // Returning profits to backer after completing games
    event ProfitsReturned(uint id, uint backerReturns);
    
    /// Only the horse can return the profits from a stake
    error ReturningProfitsSenderIsNotHorse(uint id, address sender, address horse);
    /// Profits can only be returned if a stake has been filled
    error StakeProfitNotReturnable(uint id, StakeStatus status);
    /// Message value not equal to the profit returns of the backer
    error MessageValueNotEqualToBackerReturns(uint value, uint backerReturns);
    
    // TODO: handle the case where no profit was made
    function returnProfits(uint id) external payable {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }
        Stake memory stake = stakes[id];

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
        token.transferFrom(stake.horse, stake.backer, stake.backerReturns);
        // stake.backer.transfer(stake.backerReturns);
        if (stake.escrow > 0) {
            token.transfer(stake.horse, stake.escrow);
            // stake.horse.transfer(stake.escrow);
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
    error OnlyBackerCanRequestEscrow(uint id, address backer, address sender);
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
        if (msg.sender != stakes[id].backer) {
            revert OnlyBackerCanRequestEscrow(id, stakes[id].backer, msg.sender);
        }
        if (stakes[id].escrow == 0) {
            revert CannotReturnNoEscrow(id, stakes[id].escrow);
        }

        token.transfer(stakes[id].backer, stakes[id].escrow);
        // stakes[id].backer.transfer(stakes[id].escrow);
        stakes[id].status = StakeStatus.EscrowClaimed;
        emit EscrowClaimed(id, stakes[id].escrow, stakes[id].backer);
    }

    function validId(uint id) internal view returns (bool) {
        return id < requestCount;
    }



}