// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract StakeCoin is ERC20 {
    address payable public owner;

    constructor() ERC20("Safe Stake Coin", "STK") {
        _mint(msg.sender, 1000000000000000000000000000);
        owner = payable(msg.sender);
    }
}