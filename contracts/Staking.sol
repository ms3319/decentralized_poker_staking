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
    }

    // Creating a new stake request

    event StakeRequested(address horse, uint amount);

    /// Profit share must be between 0 and 100
    error InvalidProfitShare(uint profitShare);

    function createRequest(uint amount, uint profitShare) external {
        if (profitShare > 100) {
            revert InvalidProfitShare(profitShare);
        } 
        stakes[requestCount] = Stake(requestCount, payable(msg.sender), payable(address(0)), amount, profitShare, 0, StakeStatus.Requested);
        requestCount++;

        emit StakeRequested(msg.sender, amount);
    }

    // Staking a request

    event StakeFilled(uint stakeId, address horse, address backer, uint amount);

    /// Stake has already been filled/cancelled
    error StakeNotFillable(uint id);
    /// Stake does not exist
    error InvalidStake(uint id);
    /// You cannot stake yourself
    error StakingSelf(uint id, address horse, address backer);

    function stakeHorse(uint id) external payable {
        if (id < 0 || id >= requestCount) {
            revert InvalidStake(id);
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
        horse.transfer(stake.amount);

        emit StakeFilled(id, horse, backer, stake.amount);
    }

    // Cancelling a reqested stake


    // Returning profits to backer after completing games

}