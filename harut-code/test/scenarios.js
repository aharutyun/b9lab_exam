const expectedExceptionPromise = require("../utils/expectedException.js");
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
Promise = require("bluebird");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

if (typeof web3.eth.getAccountsPromise === "undefined") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

contract('TollBoothOperator', function(accounts) {

    let regulatorOwner, operatorOwner,
        booth1, booth2,
        vehicle1, vehicle2,
        regulator, operator, someone;
    const deposit10 = 10;
    const vehicleDeposit14 = 14;
    const vehicleDeposit10 = 10;
    const vehicleType1 = 1;
    const multiplier1 = 1;
    let vehicle1BalanceBefore;
    let vehicle2BalanceBefore;
    let routePrice11 = 11;
    let routePrice6 = 6;
    let refund3 = 3;
    const vehicle1Secret = toBytes32(11);
    const vehicle2Secret = toBytes32(12);
    const gas = 3000000;
    let hashed1, hashed2;

    const scenarious = [
        {
            scenario: "Scenario 1",
            vehicleDeposit: 10,
            routePrice: 10,
            expectedFinalFee: 10,
            vehicleRefund: 0
        },
        {
            scenario: "Scenario 2",
            vehicleDeposit: 10,
            routePrice: 15,
            expectedFinalFee: 10,
            vehicleRefund: 0
        },
        {
            scenario: "Scenario 3",
            vehicleDeposit: 10,
            routePrice: 6,
            expectedFinalFee: 6,
            vehicleRefund: 4
        },
        {
            scenario: "Scenario 4",
            vehicleDeposit: 14,
            routePrice: 10,
            expectedFinalFee: 10,
            vehicleRefund: 4
        },
    ]

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 7);
        regulatorOwner = accounts[0];
        operatorOwner = accounts[1];
        booth1 = accounts[2];
        booth2 = accounts[3];
        vehicle1 = accounts[4];
        vehicle2 = accounts[5];
        someone = accounts[6];
        return web3.eth.getBalancePromise(regulatorOwner)
            .then(balance => assert.isAtLeast(web3.fromWei(balance).toNumber(), 10));
    });

    describe("Vehicle Operations", function() {

        beforeEach("should deploy regulator and operator", function() {
            return Regulator.new({ from: regulatorOwner })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle1, vehicleType1, { from: regulatorOwner }))
                .then(() => regulator.setVehicleType(vehicle2, vehicleType1, { from: regulatorOwner }))
                .then(tx => regulator.createNewOperator(operatorOwner, deposit10, { from: regulatorOwner }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth1, { from: operatorOwner }))
                .then(tx => operator.addTollBooth(booth2, { from: operatorOwner }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: operatorOwner }))
                .then(tx => operator.setPaused(false, { from: operatorOwner }))
                .then(tx => operator.hashSecret(vehicle1Secret))
                .then(hash => hashed1 = hash)
                .then(tx => operator.hashSecret(vehicle2Secret))
                .then(hash => hashed2 = hash)
        });

        scenarious.forEach(scenario =>
        {
            describe(scenario.scenario, function () {
                it(`enter the road with deposit ${scenario.vehicleDeposit}                     
                    and exit with route price ${scenario.routePrice} with refund ${scenario.vehicleRefund}`, function () {
                    return operator.enterRoad.call(
                        booth1, hashed1, {from: vehicle1, value: scenario.vehicleDeposit}) //dry run
                        .then(success => assert.isTrue(success))
                        .then(tx => operator.setRoutePrice(booth1, booth2, scenario.routePrice, {from: operatorOwner})) // set price
                        .then(() => operator.enterRoad(
                            booth1, hashed1, {from: vehicle1, value: scenario.vehicleDeposit}))//enter road
                        .then(tx => {
                            const logEntered = tx.logs[0];
                            assert.strictEqual(logEntered.event, "LogRoadEntered");
                            assert.strictEqual(logEntered.args.vehicle, vehicle1);
                            assert.strictEqual(logEntered.args.entryBooth, booth1);
                            assert.strictEqual(logEntered.args.exitSecretHashed, hashed1);
                            assert.strictEqual(logEntered.args.depositedWeis.toNumber(), scenario.vehicleDeposit);
                            return web3.eth.getBalancePromise(vehicle1);
                        })
                        .then(balance => {
                            vehicle1BalanceBefore = balance
                            return operator.reportExitRoad(vehicle1Secret, {from: booth2}); //exit road
                        })
                        .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 1);
                            assert.strictEqual(tx.logs.length, 1);
                            const logEntered = tx.logs[0];
                            assert.strictEqual(logEntered.event, "LogRoadExited");
                            assert.strictEqual(logEntered.args.exitBooth, booth2);
                            assert.strictEqual(logEntered.args.finalFee.toNumber(), scenario.expectedFinalFee);
                            assert.strictEqual(logEntered.args.exitSecretHashed, hashed1);
                            assert.strictEqual(logEntered.args.refundWeis.toNumber(), scenario.vehicleRefund);
                            return operator.getCollectedFeesAmount(); //check fee
                        })
                        .then(collectedAmount =>  {
                            assert.strictEqual(collectedAmount.toNumber(), scenario.expectedFinalFee);
                            return web3.eth.getBalancePromise(vehicle1);
                        })
                        .then(balance => assert.strictEqual(balance.toString(10), vehicle1BalanceBefore.add(scenario.vehicleRefund).toString(10)))
                });

            });
        });

        describe("Scenario 5", function () {
            it(`enter the road with deposit ${vehicleDeposit14}                     
                    and exit route with unknown price with refund ${refund3}`, function () {
                return operator.enterRoad(
                        booth1, hashed1, {from: vehicle1, value: vehicleDeposit14})//enter road
                    .then(tx => web3.eth.getBalancePromise(vehicle1))
                    .then(balance => {
                        vehicle1BalanceBefore = balance;
                        return operator.reportExitRoad(vehicle1Secret, {from: booth2}); //exit road
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);
                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogPendingPayment");
                        assert.strictEqual(logEntered.args.entryBooth, booth1);
                        assert.strictEqual(logEntered.args.exitBooth, booth2);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed1);
                        return operator.getPendingPaymentCount(booth1, booth2); //check pending payments count
                    })
                    .then(count => {
                        assert.strictEqual(count.toNumber(), 1);
                        // set price, and clear one pending payment
                        return operator.setRoutePrice(booth1, booth2, routePrice11, {from: operatorOwner});
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 2);
                        assert.strictEqual(tx.logs.length, 2);

                        assert.strictEqual(tx.logs[0].event, "LogRoutePriceSet");
                        const logEntered = tx.logs[1];
                        assert.strictEqual(logEntered.event, "LogRoadExited");
                        assert.strictEqual(logEntered.args.exitBooth, booth2);
                        assert.strictEqual(logEntered.args.finalFee.toNumber(), routePrice11);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed1);
                        assert.strictEqual(logEntered.args.refundWeis.toNumber(), refund3);
                        return operator.getPendingPaymentCount(booth1, booth2); // check pending count after setting price
                    })
                    .then(count => {
                        assert.strictEqual(count.toNumber(), 0);
                        return operator.getCollectedFeesAmount();//check fee
                    })
                    .then(collectedAmount =>  {
                        assert.strictEqual(collectedAmount.toNumber(), routePrice11);
                        return web3.eth.getBalancePromise(vehicle1);
                    })
                    .then(balance => assert.strictEqual(balance.toString(10), vehicle1BalanceBefore.add(refund3).toString(10)))
            });

        });

        describe("Scenario 6", function () {
            it(`2 vehicles enter the road where price is unknown`, function () {
                return operator.enterRoad(booth1, hashed1, {from: vehicle1, value: vehicleDeposit14})//vehicle 1 enters the road
                    .then(tx => web3.eth.getBalancePromise(vehicle1))
                    .then(balance => {
                        vehicle1BalanceBefore = balance;
                        return operator.reportExitRoad(vehicle1Secret, {from: booth2}); //vehicle 1 exit road
                    })
                    .then(tx => operator.enterRoad(booth1, hashed2, {from: vehicle2, value: vehicleDeposit10})) // vehicle 2 enters the road
                    .then(tx => web3.eth.getBalancePromise(vehicle2))
                    .then(balance => {
                        vehicle2BalanceBefore = balance;
                        return operator.reportExitRoad(vehicle2Secret, {from: booth2}); //vehicle 2 exit road
                    })
                    .then(tx => operator.getPendingPaymentCount(booth1, booth2)) //check pending payments count
                    .then(count => {
                        assert.strictEqual(count.toNumber(), 2);
                        // set price, and clear one pending payment
                        return operator.setRoutePrice(booth1, booth2, routePrice6, {from: operatorOwner});
                    })
                    .then(tx => operator.getCollectedFeesAmount()) // check collected fee
                    .then(collectedAmount =>  {
                        assert.strictEqual(collectedAmount.toNumber(), routePrice6);
                        return operator.getPendingPaymentCount(booth1, booth2);
                    })
                    .then(count => {
                        // check pending count after setting price, should be -1
                        assert.strictEqual(count.toNumber(), 1);
                        // clear 1 pending payment from someone
                        return operator.clearSomePendingPayments(booth1, booth2, 1, {from: someone});
                    })
                    .then(tx => {
                        assert.strictEqual(tx.receipt.logs.length, 1);
                        assert.strictEqual(tx.logs.length, 1);

                        const logEntered = tx.logs[0];
                        assert.strictEqual(logEntered.event, "LogRoadExited");
                        assert.strictEqual(logEntered.args.exitBooth, booth2);
                        assert.strictEqual(logEntered.args.finalFee.toNumber(), routePrice6);
                        assert.strictEqual(logEntered.args.exitSecretHashed, hashed2);
                        assert.strictEqual(logEntered.args.refundWeis.toNumber(), 4);
                       return operator.getCollectedFeesAmount(); // check collected fee
                    })
                    .then(collectedAmount =>  {
                        assert.strictEqual(collectedAmount.toNumber(), routePrice6 * 2);
                        return web3.eth.getBalancePromise(vehicle1);
                    })
                    .then(balance => {
                        //check vehicle 1 balance, refund should be 14 - 6 = 8
                        assert.strictEqual(balance.toString(10), vehicle1BalanceBefore.add(vehicleDeposit14 - routePrice6).toString(10));
                        return web3.eth.getBalancePromise(vehicle2);
                    })
                    .then(balance => {
                        //check vehicle 2 balance, refund should be 10 - 6 = 4
                        assert.strictEqual(balance.toString(10), vehicle2BalanceBefore.add(vehicleDeposit10 - routePrice6).toString(10));
                    });
            });

        });

    });

});
