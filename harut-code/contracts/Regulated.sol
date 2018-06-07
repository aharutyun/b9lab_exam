pragma solidity ^0.4.13;

import "./interfaces/RegulatorI.sol";
import "./interfaces/RegulatedI.sol";

contract Regulated is RegulatedI {
    address currentRegulator;

    function Regulated(address regulator) public {
        currentRegulator = regulator;
    }

    function setRegulator(address newRegulator)
    public
    returns(bool success) {
        require(currentRegulator == msg.sender);
        require(newRegulator != 0);
        require(currentRegulator != newRegulator);

        address currentRegulatorHolder = currentRegulator;

        currentRegulator = newRegulator;

        LogRegulatorSet(currentRegulatorHolder, newRegulator);
        return true;

    }

    function getRegulator()
        constant
        public
        returns(RegulatorI regulator) {

        return RegulatorI(currentRegulator);
    }
}
