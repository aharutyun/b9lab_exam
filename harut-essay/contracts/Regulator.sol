contract Regulator {
    address owner;

    //all registered roads addresses
    mapping(address => bool) roads;

    //all registered drivers with license plates, key is license plate number, value is a driver address
    mapping(string => address) registeredDrivers;

    //registers new toll road, only owner can do this
    function registerRoad(address roadAddress, uint fee) public;

    // registers new driver in a system, any driver can do this. Contract shoud check validness of driver's data
    function registerDriver(string licensePlate, address driverContractAddress) public;

    // get the driver address from license plate
    function getDriverFromLicensePlate(string licensePlate) public constant returns (address driver);
}