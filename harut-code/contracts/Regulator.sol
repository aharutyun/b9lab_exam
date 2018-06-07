pragma solidity ^0.4.13;

import "./TollBoothOperator.sol";
import "./interfaces/RegulatorI.sol";
import "./Owned.sol";

contract Regulator is RegulatorI,Owned {
    mapping(address => uint) vehicleTypes;
    //for ui, get list of vehicle types, in real world it can be stored in external db
    address[] vehiclesAddresses;

    mapping(address => bool) operators;

    //for ui, get list of operators, in real world it can be stored in external db
    address[] operatorsAddresses;

    function Regulator() {}

    function setVehicleType(address vehicle, uint vehicleType) fromOwner
    public
    returns(bool success) {
        require(vehicle != 0);
        require(vehicleTypes[vehicle] != vehicleType);

        vehicleTypes[vehicle] = vehicleType;
        vehiclesAddresses.push(vehicle);

        LogVehicleTypeSet(msg.sender, vehicle, vehicleType);

        return success;
    }

    function getVehiclesAddresses() constant returns (address[] addresses) {
        return vehiclesAddresses;
    }

    function getOperatorsAddresses() constant returns (address[] addresses) {
        return operatorsAddresses;
    }

    function getVehicleType(address vehicle)
        constant
        public
        returns(uint vehicleType) {

        return uint(vehicleTypes[vehicle]);
    }

    function createNewOperator(
        address owner,
        uint deposit)
        public
        returns(TollBoothOperatorI newOperator) {

        require(owner != getOwner());

        TollBoothOperator operator = new TollBoothOperator(true, deposit, this);
        operator.setOwner(owner);
        operators[operator] = true;
        operatorsAddresses.push(operator);
        LogTollBoothOperatorCreated(msg.sender, operator, owner, deposit);

        return operator;
    }

    function removeOperator(address operator)
        fromOwner
        public
        returns(bool success) {

        require(operators[operator]);

        operators[operator] = false;

        LogTollBoothOperatorRemoved(msg.sender, operator);

        return true;
    }

    function isOperator(address operator)
        constant
        public
        returns(bool indeed) {

        return operators[operator];
    }
}
