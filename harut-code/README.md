# Toll Road application

## Instruction

   1. Implementation of Smart contracts are located in **contracts/** folder
   2. Tests are located in **test/scenarious.js**
   3. UI has been implemeneted using ReactJS and is located in folder **ui/**
   4. The application has been tested by using **testrpc** on vagrant env
   
## Installation

Before run application, it must be properly installed
Here are the steps of installation

1. Install projects by using command

````
    npm install
````

2. Compile and deploy smart contracts(make sure that ethereum blockchain client running, i.e. testrpc)

````
    truffle compile
    truffle deploy
````
3. Install GUI
````
   cd ui
   npm install
````

## Run application

Before running application, you can configure environment.
There are 2 environment variables in **.env** file
**REACT_APP_USE_INJECTED_WEB3** - if set yes, it will use metamask, 
if it is available, otherwise it will use **REACT_APP_WEB3_PROVIDER_URL**.

To run application commands need to be executed. 
Make sure, that you are in root directory 
````
   cd ui
   npm start
````
Open browser, and go to http://localhost:8080 
