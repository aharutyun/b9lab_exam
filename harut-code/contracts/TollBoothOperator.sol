pragma solidity ^0.4.13;

import "./interfaces/TollBoothOperatorI.sol";
import "./Owned.sol";
import "./Pausable.sol";
import "./DepositHolder.sol";
import "./TollBoothHolder.sol";
import "./MultiplierHolder.sol";
import "./RoutePriceHolder.sol";
import "./Regulated.sol";

contract TollBoothOperator is TollBoothOperatorI, Owned, Pausable, DepositHolder,
                TollBoothHolder, MultiplierHolder, RoutePriceHolder, Regulated {

    mapping(bytes32 => DriverTripInfo) driversTripInfo;

    uint collectedFee;

    struct DriverTripInfo {
        address vehicle;
        address entryBooth;
        address exitBooth;
        uint depositedWeis;
    }

    struct RoutePendingPayment {
        bytes32[] vehicleHashes;
        uint startIndex;
    }

    mapping(address => mapping(address => RoutePendingPayment)) pendingPayments;

    function TollBoothOperator(bool _paused, uint _deposit, address _regulator)
        Pausable(_paused)
        DepositHolder(_deposit)
        Regulated(_regulator) public {

    }

    function hashSecret(bytes32 secret)
        constant
        public
        returns(bytes32 hashed) {
            return keccak256(secret);
    }

    function enterRoad(
            address entryBooth,
            bytes32 exitSecretHashed)
        whenNotPaused
        public
        payable
        returns (bool success) {

        require(isTollBooth(entryBooth));

        //get vehicle type from Regulator
        uint vehicleType = getRegulator().getVehicleType(msg.sender);

        //check, whether vehicle is registered
        require(vehicleType != 0);

        //calculate amount of deposit, to be more than multiplier*deposit
        require(msg.value >= getMultiplier(vehicleType) * getDeposit());

        //driver not exitted yet, from previous entry
        require(driversTripInfo[exitSecretHashed].exitBooth == 0);

        //check, whether secret has been used before
        require(driversTripInfo[exitSecretHashed].vehicle == 0);

        driversTripInfo[exitSecretHashed].vehicle = msg.sender;
        driversTripInfo[exitSecretHashed].entryBooth = entryBooth;
        driversTripInfo[exitSecretHashed].depositedWeis = msg.value;

        LogRoadEntered(msg.sender, entryBooth, exitSecretHashed, msg.value);


        return true;
    }

    function getVehicleEntry(bytes32 exitSecretHashed)
        constant
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis) {

        return (driversTripInfo[exitSecretHashed].vehicle,
                driversTripInfo[exitSecretHashed].entryBooth,
                driversTripInfo[exitSecretHashed].depositedWeis);
    }

    function reportExitRoad(bytes32 exitSecretClear)
        whenNotPaused
        public
        returns (uint status) {

        address exitBooth = msg.sender;
        require(exitSecretClear != 0);

        bytes32 hashedSecret = hashSecret(exitSecretClear);

        require(isTollBooth(exitBooth));

        DriverTripInfo storage driverTripInfo = driversTripInfo[hashedSecret];

        //check, vehicle exists
        require(driverTripInfo.vehicle != 0);

        //check booth is not same as entry
        require(exitBooth != driverTripInfo.entryBooth);

        uint price = getRoutePrice(driverTripInfo.entryBooth, exitBooth);

        // if price is set, collect deposit
        if (price != 0) {
            exitOperation(hashedSecret, price, exitBooth);
            return 1;
        } else {
            pendingPayments[driverTripInfo.entryBooth][msg.sender].vehicleHashes.push(hashedSecret);
            LogPendingPayment(hashedSecret, driverTripInfo.entryBooth, exitBooth);
            return 2;
        }
    }

    function exitOperation(bytes32 hashedSecret, uint price, address exitBooth) private {
        DriverTripInfo storage driverTripInfo = driversTripInfo[hashedSecret];
        uint vehicleType = getRegulator().getVehicleType(driverTripInfo.vehicle);
        uint priceToBePayed = price * getMultiplier(vehicleType);
        uint refund = 0;
        uint finalFee = 0;

        if (driverTripInfo.depositedWeis <= priceToBePayed) {
            finalFee = driverTripInfo.depositedWeis;
            refund = 0;
        } else {
            finalFee = priceToBePayed;
            refund = driverTripInfo.depositedWeis - priceToBePayed;
        }

        collectedFee += finalFee;
        driverTripInfo.depositedWeis = 0;
        LogRoadExited(exitBooth, hashedSecret, finalFee, refund);

        //send refund
        if (refund > 0) {
            driverTripInfo.vehicle.transfer(refund);
        }
    }

    function getPendingPaymentCount(address entryBooth, address exitBooth)
        constant
        public
        returns (uint count) {

        RoutePendingPayment storage pending = pendingPayments[entryBooth][exitBooth];
        return pending.vehicleHashes.length - pending.startIndex;
    }

    function clearSomePendingPayments(
            address entryBooth,
            address exitBooth,
            uint count)
        public
        returns (bool success) {

        RoutePendingPayment storage pending = pendingPayments[entryBooth][exitBooth];
        for (uint i = 0; i < count && pending.startIndex < pending.vehicleHashes.length; i ++) {
            exitOperation(pending.vehicleHashes[pending.startIndex], getRoutePrice(entryBooth, exitBooth), exitBooth);
            pending.startIndex ++;
        }
        return true;
    }

    function getCollectedFeesAmount()
        constant
        public
        returns(uint amount) {

        return collectedFee;
    }


    function withdrawCollectedFees()
        fromOwner
        public
        returns(bool success) {

        require(collectedFee > 0);
        collectedFee = 0;
        LogFeesCollected(msg.sender, collectedFee);
        msg.sender.transfer(collectedFee);
        return true;
    }

    function setRoutePrice(
            address entryBooth,
            address exitBooth,
            uint priceWeis)
        public
        returns(bool success) {
        //set price
        if (RoutePriceHolder.setRoutePrice(entryBooth, exitBooth, priceWeis)) {
            //clear one pending payment
            clearSomePendingPayments(entryBooth, exitBooth, 1);
            return true;
        }
        return false;
    }

}
