// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./StakeCoin.sol";

contract owned {
    StakeCoin stakeCoin;
    address owner;

    constructor(address stakeCoinAddress) {
        owner = msg.sender;
        stakeCoin = StakeCoin(stakeCoinAddress);
    }

    modifier onlyOwner {
        require(msg.sender == owner,
        "Only the contract owner can call this function");
        _;
    }
}

contract mortal is owned {

    constructor(address stakeCoinAddress) owned(stakeCoinAddress) {}
    // Only owner can shutdown this contract.
    function destroy() public onlyOwner {
        stakeCoin.transfer(owner, stakeCoin.balanceOf(address(this)));
        selfdestruct(payable(msg.sender));
    }
}

contract StakeCoinFaucet is mortal {

    constructor(address stakeCoinAddress) mortal(stakeCoinAddress) {}

    event Withdrawal(address indexed to, uint amount);
    event Deposit(address indexed from, uint amount);

    // Give out STK to anyone who asks
    function withdraw(uint withdraw_amount) public {
        // Limit withdrawal amount
        require(withdraw_amount <= 0.1 ether);
        require(stakeCoin.balanceOf(address(this)) >= withdraw_amount,
            "Insufficient balance in faucet for withdrawal request");
        // Send the amount to the address that requested it
        stakeCoin.transfer(msg.sender, withdraw_amount);
        emit Withdrawal(msg.sender, withdraw_amount);
    }

    // Accept any incoming amount
    receive () external payable {
        emit Deposit(msg.sender, msg.value);
    }
}