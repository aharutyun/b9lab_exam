import { CONFIG } from '../util/config'

export const getBalance = async (owner) => {
  const balance = await CONFIG.web3.eth.getBalance(owner)
  return balance.toString()
}

export const getVehicles = async () => {
  return await execConstant(async () => {
    const vehiclesAddresses = await CONFIG.regulatorInstance.getVehiclesAddresses()
    const vehicles = []
    for (let i = 0; i < vehiclesAddresses.length; i++) {
      const vehicleType = await
      CONFIG.regulatorInstance.getVehicleType(vehiclesAddresses[i])
      vehicles.push({ vehicle: vehiclesAddresses[i], vehicleType: vehicleType.toString() })
    }
    return vehicles
  })
}

export const getVehicleTypes = async () => {
  return await execConstant(async () => {
    const vehicles = await getVehicles()
    const map = {}
    vehicles.forEach(vehicle => {
      map[vehicle.vehicleType] = 1
    })
    return Object.keys(map)
  })
}

export const getExitRoadInformation = async (operatorAddress, secret, callback) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const hashed = await
    operatorInstance.hashSecret(secret)
    const event = operatorInstance.LogRoadExited({ exitSecretHashed: hashed }, { fromBlock: 1 })
    event.get((err, result) => {
      if (err) alert(err)
      else callback(result)
    })
  })
}

export const getPendingPayment = async (operatorAddress, secret, callback) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const hashed = await
    operatorInstance.hashSecret(secret)
    const event = operatorInstance.LogPendingPayment({ exitSecretHashed: hashed }, { fromBlock: 1 })
    event.get((err, result) => {
      if (err) alert(err)
      else callback(result)
    })
  })
}

export const getVehicleHistory = async (operatorAddress, vehicleAddress, callback) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const event = operatorInstance.LogRoadEntered({ vehicle: vehicleAddress }, { fromBlock: 1 })

    event.get((err, enterResult) => {
      if (enterResult.length > 0) {
        console.log(enterResult)
        const exitEvent = operatorInstance.LogRoadExited({ exitSecretHashed: enterResult[0].args.exitSecretHashed },
          { fromBlock: 1 })
        exitEvent.get((err, exitResult) => {
          console.log(exitResult)
          callback([...enterResult, ...exitResult])
        })
      } else {
        callback(enterResult)
      }
    })
  })
}

export const setVehicleType = async (_address, _type, _regulator, gas) => {
  await execTransaction(() => CONFIG.regulatorInstance.setVehicleType(_address, _type, { from: _regulator, gas }))
}

export const createOperator = async (_owner, _deposit, _regulator, gas) => {
  await execTransaction(() => CONFIG.regulatorInstance.createNewOperator(_owner, _deposit, { from: _regulator, gas }))
}

export const getOperators = async () => {
  return await execConstant(async () => {
    const operatorsAddresses = await CONFIG.regulatorInstance.getOperatorsAddresses()

    const operators = []
    for (let i = 0; i < operatorsAddresses.length; i++) {
      const operatorInstance = await CONFIG.operator.at(operatorsAddresses[i])
      operators.push({ operator: operatorsAddresses[i], isPaused: await operatorInstance.isPaused() })
    }
    return operators
  })
}

export const isOperatorPaused = async (operatorAddress) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    return await operatorInstance.isPaused()
  })
}

export const setPaused = async (operatorAddress, paused, from, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  await execTransaction(() => operatorInstance.setPaused(paused, { from, gas }))
}

export const getRequiredDeposit = async (operatorAddress) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const deposit = await operatorInstance.getDeposit()
    return deposit.toString()
  })
}

export const enterRoad = async (operatorAddress, entryBooth, secret, from, value, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  const hashedSecret = await operatorInstance.hashSecret(secret)
  await execTransaction(() => operatorInstance.enterRoad(entryBooth, hashedSecret, { from, value, gas }))
}

export const exitRoad = async (operatorAddress, exitBooth, secret, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  await execTransaction(() => operatorInstance.reportExitRoad(secret, { from: exitBooth, gas }))
}

export const addTollBooth = async (tollBoothAddress, operatorAddress, from, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  await execTransaction(() => operatorInstance.addTollBooth(tollBoothAddress, { from, gas }))
}

export const getTollBooths = async (operatorAddress) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    return await operatorInstance.getTollBooths()
  })
}

export const setMultiplier = async (operatorAddress, vehicleType, multiplier, from, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  await execTransaction(() => operatorInstance.setMultiplier(vehicleType, multiplier, { from, gas }))
}

export const getOperatorOwner = async (operatorAddress) => {
  return await execConstant(async () => {
    const instance = await CONFIG.operator.at(operatorAddress)
    return await instance.getOwner()
  })
}

export const getRegulatorOwner = async () => {
  return await execConstant(async () => {
    return await CONFIG.regulatorInstance.getOwner()
  })
}

export const getMultipliers = async (operatorAddress) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const types = await getVehicleTypes()

    const multipliers = []
    for (let i = 0; i < types.length; i++) {
      const multiplier = await operatorInstance.getMultiplier(types[i])
      if (multiplier.toNumber() !== 0) {
        multipliers.push({ vehicleType: types[i], value: multiplier.toString() })
      }
    }
    return multipliers
  })
}

export const setRoutePrice = async (operatorAddress, price, fromBooth, toBooth, from, gas) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  execTransaction(() => operatorInstance.setRoutePrice(fromBooth, toBooth, price, { from, gas }))
}

export const getPricedRoutes = async (operatorAddress) => {
  return await execConstant(async () => {
    const operatorInstance = await CONFIG.operator.at(operatorAddress)
    const tollBooths = await operatorInstance.getTollBooths()

    const pricedRoutes = []
    for (let i = 0; i < tollBooths.length - 1; i++) {
      for (let j = i + 1; j < tollBooths.length; j++) {
        let price = await operatorInstance.getRoutePrice(tollBooths[i], tollBooths[j])
        if (price.toNumber() !== 0) {
          pricedRoutes.push({ from: tollBooths[i], to: tollBooths[j], price: price.toString() })
        }

        price = await operatorInstance.getRoutePrice(tollBooths[j], tollBooths[i])
        if (price.toNumber() !== 0) {
          pricedRoutes.push({ from: tollBooths[j], to: tollBooths[i], price: price.toString() })
        }
      }
    }
    return pricedRoutes
  })
}

export const hasMultiplier = async (operatorAddress, vehicle) => {
  const operatorInstance = await CONFIG.operator.at(operatorAddress)
  console.log(operatorInstance)
  const type = await CONFIG.regulatorInstance.getVehicleType(vehicle)
  const mult = await operatorInstance.getMultiplier(type)
  return mult.toNumber() !== 0
}

export const hidden = (value) => {
  let foundEmpty = false
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '' || !value[i]) {
      foundEmpty = true
    }
  }
  return !foundEmpty ? '' : 'invisible'
}

const execTransaction = async (executor) => {
  try {
    const txObject = await executor()
    console.log(txObject)
    if (txObject.logs.length === 0) {
      alert('Transaction failed: Please, check console')
    }
  } catch (e) {
    console.log(e)
    alert(e)
  }
}

const execConstant = async (executor) => {
  try {
    return await executor()
  } catch (e) {
    console.log(typeof e)
    console.log(e)
    alert(e)
  }
}
