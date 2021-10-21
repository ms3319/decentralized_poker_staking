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

        emit StakeFilled(id, horse, backer, stake.amount);
    }

    // Cancelling a reqested stake

    event StakeCanceled(uint id);

    function cancelStakeAsHorse(uint id) external payable {
        Stake memory stake = stakes[id];
        require(msg.sender == stake.horse,"You can only cancel your own stakes!");
        require(stake.status == StakeStatus.Requested,"You can only cancel your stake if it has not been filled!");
        require(validId(id), "This is not a valid ID for a stake!");
        stake.backer.transfer(stake.amount);
        stakes[id].status = StakeStatus.Cancelled;
        emit StakeCanceled(id);
    }
    
    // Still need to figure out this part
    
    function cancelStakeAsBacker(uint id) external payable {
        Stake memory stake = stakes[id];
        require(msg.sender == stake.backer);
        require(validId(id), "This is not a valid ID for a stake!");
    }

    // Returning profits to backer after completing games

    event ProfitsReturned(uint id);

    function returnProfits(uint id) external payable {
        Stake memory stake = stakes[id];
        require(validId(id), "This is not a valid ID for a stake!");
        require(stake.horseWon, "The horse does need to return any profits");
        stake.backer.transfer(stake.profit);
        stakes[id].status = StakeStatus.Completed;
        emit ProfitsReturned(id);
    }

    function validId(uint id) internal returns (bool) {
        if(id < 0 || id >= requestCount) {
            return false;
        }
        return true;
    }

}