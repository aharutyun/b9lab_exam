contract Driver {
    address owner;

    struct Vehicle {
        string licensePlateNumber;
        string country;
        string vin;
    }


    // the list of roads, which autorized to get payments from this driver
    mapping(address => bool) approvedRoads;

    // map, which stores all driver's vehicles, where key is VIN number
    mapping(string => Vehicle) vehicles;

    // registers new vehicle, only owner can do this, throws vin already exists, and add license plate to regulator
    function registerVehicle(string licensePlateNumber, string country, string vin) public;

    // remove vehicle from his list, only owner can do this,
    function unregisterVehicle(string vin) public;

    // deposit money to contract, in order to pay toll roads, only owner can do this
    function deposit() public payable;

    //send payment request to driver and withdraw money from contract equal to fee of road, only approved roads allowed
    function sendPaymentRequest(address roadAddress) public;

}