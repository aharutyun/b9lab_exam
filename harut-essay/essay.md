# Toll road blockchain proposal

## Background 

The concept is based on electronic toll collection: https://en.wikipedia.org/wiki/Electronic_toll_collection

In the current proposal manual toll collections are not mentioned, as they considered slow and not actual.

## Problem

There are many electronic toll collection systems like **Autopass**, **E-Zpass** etc.
The aim to electronic toll collection systems to collect toll without requiring to stop the car.
But there are several drawbacks for this kind of systems.

 1. Driver has to register himself in every toll road system that he passes, this can be annoying in case if driver passes several countries
 2. Every system requires credit card registration, in some cases this is dangerous, as pay system can be fraud
 3. Payment always has to be done by using third party systems like Visa/Mastercard
 
## Solution 

The solution is to have unified electronic toll collection system across the world by using blockchain.

Why blockchain:

 1. No trusted party requires, as it is distributed and it is using consensus approach.
 2. Payment method selection is not required, as blockchain itself provides payment mechanism.
 3. Payment directly are being sent from customer to toll road operator, no middleware required
 4. No data reconciliation required between systems
 5. Data is immutable, so they cannot be compromised(i.e. payments denial)
 
 
## Distrbuted application

### Paricipants

**Regulator** - registers new toll road in a system and sets fee of road, keeps track of all roads and drivers

**Road** - actual toll road, which tracks for vehicles, and send payments to drivers who uses toll roads

**Driver** - this is actual customer of the system, who uses toll road, it can register vehicles

**Vehicle** - driver's vehicle, which actually being tracked by toll road operator 

### Flow

The system begining from regulator, who registers toll road in the system and sets the fee after due dilligence.
The regulator tracks all the drivers by their license plate numbers, this information needed for toll road operator(road owner), 
in order to determine to whom send payments.

After registering toll roads by regulator, any person who ownes the car, can enter the system, register himself as a driver, 
put information about his car and select which roads he wants to use during his trip.
The driver must deposit money(ether, in this case) to his account, as this deposit will be used from toll road operators to collect tolls.

The road operator, after indication that vehicle uses toll road, captures vehicle plate number, 
gets the driver information from regulator by plate number and send payment request to driver, where payment is done. 
The system allows toll road operator to withdraw paymenys at any time.

### Smart contracts

There are several high level smart contracts interfaces in gitlab repo, which can be used to build the system.
