pragma solidity ^0.4.13;

import "./interfaces/OwnedI.sol";

contract Owned is OwnedI {
    address theOwner;

    function Owned() public {
        theOwner = msg.sender;
    }

    modifier fromOwner {
        require(theOwner == msg.sender);
        _;
    }

    function setOwner(address newOwner) fromOwner returns(bool success) {
        require(newOwner != 0);
        require(newOwner != theOwner);

        theOwner = newOwner;
        LogOwnerSet(msg.sender, newOwner);
        return true;
    }

    function getOwner() constant returns(address owner) {
        return theOwner;
    }
}
