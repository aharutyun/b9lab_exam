pragma solidity ^0.4.13;

import "./interfaces/DepositHolderI.sol";
import "./Owned.sol";

contract DepositHolder is DepositHolderI, Owned {
    uint currentDeposit;

    function DepositHolder(uint depositWeis) public {
        require(depositWeis > 0);
        currentDeposit = depositWeis;
    }

    function setDeposit(uint depositWeis)
        fromOwner
        public
        returns(bool success) {

        require(depositWeis != 0);
        require(currentDeposit != depositWeis);

        currentDeposit = depositWeis;

        LogDepositSet(msg.sender, depositWeis);
        return true;
    }

    function getDeposit()
        constant
        public
        returns(uint weis) {
        return currentDeposit;
    }
}
