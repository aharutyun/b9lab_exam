pragma solidity ^0.4.13;

import "./interfaces/RoutePriceHolderI.sol";
import "./Owned.sol";
import "./TollBoothHolder.sol";

contract RoutePriceHolder is RoutePriceHolderI, Owned, TollBoothHolder {

    mapping(address => mapping(address => uint)) routePrices;

    function setRoutePrice(
                address entryBooth,
                address exitBooth,
                uint priceWeis)
        fromOwner
        public
        returns(bool success) {

        require(entryBooth != 0 && exitBooth != 0);
        require(isTollBooth(entryBooth) && isTollBooth(exitBooth));
        require(entryBooth != exitBooth);
        require(routePrices[entryBooth][exitBooth] == 0
        || routePrices[entryBooth][exitBooth] != priceWeis);

        routePrices[entryBooth][exitBooth] = priceWeis;

        LogRoutePriceSet(msg.sender, entryBooth, exitBooth, priceWeis);
        return true;

    }

    function getRoutePrice(
            address entryBooth,
            address exitBooth)
        constant
        public
        returns(uint priceWeis) {

        return routePrices[entryBooth][exitBooth];
    }
}
