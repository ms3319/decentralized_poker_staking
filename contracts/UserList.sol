pragma solidity ^0.5.6;

contract UserList {
    address[] public users;

    // Add to users
    function add() public {
        users.push(msg.sender);
    }

    // Retrieving the users
    function getUsers() public view returns (address[] memory) {
        return users;
    }
}