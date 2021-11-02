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
        Expired,
        Cancelled,
        AwaitingReturnPayment,
        Completed
    }

    struct Stake {
        uint id;
        address payable horse;
        address payable backer;
        uint amount;
        uint escrow;
        uint profitShare;
        uint profit;
        StakeStatus status;
        bool horseWon;
    }

    struct Player {
        address payable playerAddress;
        string name;
        string sharkscopeLink;
        Stake[] stakes; // stakes where the player is the horse.
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function createPlayer(string memory name, string memory sharkscopeLink) external payable {
        players[msg.sender].playerAddress = payable(msg.sender);
        players[msg.sender].name = name;
        players[msg.sender].sharkscopeLink = sharkscopeLink;
    }

    function getPlayer(address add) external view returns (Player memory) {
        return players[add];
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

    function createRequest(uint amount, uint profitShare, uint escrow) external payable {
        if (profitShare > 100) {
            revert InvalidProfitShare(profitShare);
        }
        if (escrow > 0 && escrow != msg.value) {
            revert EscrowValueNotMatching(escrow, msg.value);
        }
        stakes[requestCount] = Stake(requestCount, payable(msg.sender), payable(address(0)), amount, escrow, profitShare, 0, StakeStatus.Requested, false);
        players[msg.sender].stakes.push(stakes[requestCount]);
        requestCount++;

        emit StakeRequested(msg.sender, amount, escrow);
    }

    // Staking a request
    event StakeFilled(uint stakeId, address horse, address backer, uint amount);
    
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
        
        if (msg.value != stake.amount) {
            revert ValueDoesNotMatchStakeAmount(id, msg.value, stake.amount);
        }

        // Update stake status and transfer funds
        stake.status = StakeStatus.Filled;
        stake.backer = backer;
        horse.transfer(stake.amount);

        stakes[id] = stake;
        emit StakeFilled(id, horse, backer, stake.amount);
    }

    // Cancelling a reqested stake
    event StakeCanceled(uint id);
    
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
        emit StakeCanceled(id);
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
    function returnProfits(uint id, uint profit) external payable {
        if(!validId(id)) {
            revert InvalidStakeId(id);
        }
        Stake memory stake = stakes[id];

        if (msg.sender != stake.horse) {
            revert ReturningProfitsSenderIsNotHorse(id, msg.sender, stake.horse);
        }
        
        if (stake.status != StakeStatus.Filled) {
            revert StakeProfitNotReturnable(id, stake.status);
        }

        // TODO: Check this calculation. Do we do it here or calculate it in the frontend?
        stake.profit = profit;
        uint backerReturns = stake.amount + ((profit * stake.profitShare) / 100);

        // TODO: See above before we can do this
        // if (msg.value != backerReturns) {
        //     revert MessageValueNotEqualToBackerReturns(msg.value, backerReturns);
        // }
        stake.backer.transfer(backerReturns);
        if (stake.escrow > 0) {
            stake.horse.transfer(stake.escrow);
        }
        stake.status = StakeStatus.Completed;

        stakes[id] = stake;
        emit ProfitsReturned(id, backerReturns);
    }

    function validId(uint id) internal view returns (bool) {
        return id < requestCount;
    }



}