contract Road {
    address owner;
    uint roadFee; //road fee that must be set by regulator

    // send payment request to driver, who uses toll road
    function sendPaymentRequestToDriver(address driverAddress) public;

    // withraw all the road money to owner
    function withdraw() public;

    function () public payable;
}