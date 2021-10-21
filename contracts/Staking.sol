pragma solidity ^0.8.9;

contract Staking {
    uint public requestCount = 0;
    mapping(uint => Stake) public stakes;

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
        uint profitShare;
        uint profit;
        StakeStatus status;
        bool horseWon;
    }

    // Get an individual stake

    function getStake(uint id) external view returns (Stake memory) {
        require(validId(id), "This is not a valid stake id!");

        return stakes[id];
    }

    // Creating a new stake request

    event StakeRequested(address horse, uint amount);

    /// Profit share must be between 0 and 100
    error InvalidProfitShare(uint profitShare);

    function createRequest(uint amount, uint profitShare) external {
        if (profitShare > 100) {
            revert InvalidProfitShare(profitShare);
        } 
        stakes[requestCount] = Stake(requestCount, payable(msg.sender), payable(address(0)), amount, profitShare, 0, StakeStatus.Requested,false);
        requestCount++;

        emit StakeRequested(msg.sender, amount);
    }

    // Staking a request
    event StakeFilled(uint stakeId, address horse, address backer, uint amount);
    /// Stake has already been filled/cancelled
    error StakeNotFillable(uint id);
    /// You cannot stake yourself
    error StakingSelf(uint id, address horse, address backer);
   
    function stakeHorse(uint id) external payable {
        require(validId(id), "This is not a valid ID for a stake!");
    
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
        horse.transfer(stake.amount);

        stakes[id] = stake;
        emit StakeFilled(id, horse, backer, stake.amount);
    }

    // Cancelling a reqested stake

    event StakeCanceled(uint id);

    function cancelStakeAsHorse(uint id) external payable {
        require(validId(id), "This is not a valid ID for a stake!");
        Stake memory stake = stakes[id];

        require(msg.sender == stake.horse, "You can only cancel your own stakes!");
        require(stake.status == StakeStatus.Requested, "You can only cancel your stake if it has not been filled!");

        stake.backer.transfer(stake.amount);
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

    // TODO: handle the case where no profit was made
    function returnProfits(uint id, uint profit) external payable {
        require(validId(id), "This is not a valid ID for a stake!");
        Stake memory stake = stakes[id];

        require(msg.sender == stake.horse, "Only the horse can return profits");
        require(stake.status == StakeStatus.Filled, "Can only return profits on a stake that has been filled and played.");

        // TODO: Check this calculation. Do we do it here or calculate it in the frontend?
        stake.profit = profit;
        uint backerReturns = stake.amount + (profit * (stake.profitShare / 100));

        stake.backer.transfer(backerReturns);
        stake.status = StakeStatus.Completed;

        stakes[id] = stake;
        emit ProfitsReturned(id, backerReturns);
    }

    function validId(uint id) internal view returns (bool) {
        if(id < 0 || id >= requestCount) {
            return false;
        }
        return true;
    }

}