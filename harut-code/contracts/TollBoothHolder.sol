pragma solidity ^0.4.13;

import "./interfaces/TollBoothHolderI.sol";
import "./Owned.sol";

contract TollBoothHolder is TollBoothHolderI, Owned {
    mapping(address => bool) tollBooths;
    address[] tollBoothsAddresses;

    function addTollBooth(address tollBooth)
        fromOwner
        public
        returns(bool success) {

        require(tollBooth != 0);
        require(!tollBooths[tollBooth]);

        tollBooths[tollBooth] = true;
        tollBoothsAddresses.push(tollBooth);

        LogTollBoothAdded(msg.sender, tollBooth);

        return success;

    }

    function getTollBooths() constant returns (address[] addresses) {
        return tollBoothsAddresses;
    }

    function isTollBooth(address tollBooth)
        constant
        public
        returns(bool isIndeed) {

        return tollBooths[tollBooth];
    }

    function removeTollBooth(address tollBooth)
        fromOwner
        public
        returns(bool success) {

        require(tollBooth != 0);
        require(tollBooths[tollBooth]);

        tollBooths[tollBooth] = false;

        LogTollBoothRemoved(msg.sender, tollBooth);
        return true;

    }
}
