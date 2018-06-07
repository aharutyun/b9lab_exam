pragma solidity ^0.4.13;

import "./interfaces/MultiplierHolderI.sol";
import "./Owned.sol";

contract MultiplierHolder is MultiplierHolderI, Owned {

    mapping(uint => uint) vehicleMultiplier;

    function setMultiplier(uint vehicleType, uint multiplier)
        fromOwner
        public
        returns(bool success) {

        require(vehicleType != 0);
        require(vehicleMultiplier[vehicleType] != multiplier);

        vehicleMultiplier[vehicleType] = multiplier;
        LogMultiplierSet(msg.sender, vehicleType, multiplier);

        return true;
    }

    function getMultiplier(uint vehicleType)
        constant
        public
        returns(uint multiplier) {

        return vehicleMultiplier[vehicleType];
    }
}
