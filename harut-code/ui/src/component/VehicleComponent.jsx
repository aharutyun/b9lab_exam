import React, { Component } from 'react'
import Panel from 'react-bootstrap/lib/Panel'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import FormControl from 'react-bootstrap/lib/FormControl'
import Table from 'react-bootstrap/lib/Table'
import Button from 'react-bootstrap/lib/Button'
import Label from 'react-bootstrap/lib/Label'
import { CONFIG } from '../util/config'
import * as Web3Service from '../service/Web3Service'
import { hidden } from '../service/Web3Service'

class VehicleComponent extends Component {

  constructor (props) {
    super(props)
    this.state = {
      gas: CONFIG.DEFAULT_GAS_LIMIT,
      vehicle: '',
      balance: 0,
      requiredDeposit: 0,
      operator: '',
      deposit: 0,
      secret: '',
      vehicleMessage: '',
      vehicleChecked: false,
      availableOperators: [],
      selectedEntryBooth: '',
      disabled: false,
      tollBooths: [],
      history: []
    }
  }

  async componentWillMount () {
    this.setDisabled()
    const availableOperators = await Web3Service.getOperators()
    this.setState({
      ...this.state,
      availableOperators,
      disabled: false
    })
  }

  handleChange (e) {
    this.setState({ ...this.state, [e.target.id]: e.target.value })
  }

  async selectOperator (e) {
    await this.loadOperatorDetails(e.target.value)
  }

  async selectEntryBooth (e) {
    this.setDisabled()
    const selectedEntryBooth = e.target.value
    const requiredDeposit = await Web3Service.getRequiredDeposit(this.state.operator)
    this.setState({ ...this.state, selectedEntryBooth, requiredDeposit, disabled: false })
  }

  async refreshBalance () {
    let balance = 0
    try {
      balance = await Web3Service.getBalance(this.state.vehicle)
    } catch (e) {
      balance = 0
    }
    this.setState({ ...this.state,
      balance:  balance })
  }

  async checkVehicle () {
    let vehicleChecked = false
    let vehicleMessage = 'Vehicle is not registered. Ask regulator to do so'
    this.setDisabled()
    const vehicles = await Web3Service.getVehicles()
    for (let i = 0; i < vehicles.length; i++) {
      if (vehicles[i].vehicle === this.state.vehicle) {
        await this.refreshBalance()
        vehicleChecked = true
        vehicleMessage = ''
        break
      }
    }
    this.setState({ ...this.state, vehicleChecked, vehicleMessage, disabled: false })
  }

  setDisabled (disabled = true) {
    this.setState({
      ...this.state,
      disabled: disabled
    })
  }

  async enterRoad () {
    this.setDisabled()
    const isPaused = await Web3Service.isOperatorPaused(this.state.operator)
    const multiplier = await Web3Service.hasMultiplier(this.state.operator, this.state.vehicle)

    if (isPaused) alert('Operator is paused. Operator owner can change status on operator screen')
    else if (!multiplier) alert('Vehicle does not have multiplier for this operator. You can specify in operator screen')
    else {
      await Web3Service.enterRoad(this.state.operator, this.state.selectedEntryBooth,
        this.state.secret, this.state.vehicle, this.state.deposit, this.state.gas)

      Web3Service.getVehicleHistory(this.state.operator, this.state.vehicle, (history) => {
        this.setState({ ...this.state, history })
      })
    }
    this.setDisabled(false)
  }

  reset () {
    this.setState({
      gas: CONFIG.DEFAULT_GAS_LIMIT,
      vehicle: '',
      balance: 0,
      requiredDeposit: 0,
      operator: '',
      deposit: 0,
      secret: '',
      vehicleMessage: '',
      vehicleChecked: false,
      availableOperators: [],
      selectedEntryBooth: '',
      disabled: false,
      tollBooths: [],
      history: []
    })
  }

  async loadOperatorDetails (operator) {
    if (operator !== '') {
      this.setDisabled()
      const tollBooths = await Web3Service.getTollBooths(operator)

      Web3Service.getVehicleHistory(operator, this.state.vehicle, (history) => {
        this.setState({ ...this.state, history })
      })

      this.setState({
        ...this.state,
        tollBooths,
        operator,
        disabled: false
      })
    } else {
      this.setState({
        ...this.state,
        selectedEntryBooth: '',
        tollBooths: []
      })
    }
  }

  render () {
    const availableOperators = this.state.availableOperators
      .map(op => (<option key={op.operator} value={op.operator}>{op.operator}</option>))
    const availableTollBooths = this.state.tollBooths
      .map(tollBooth => (<option key={tollBooth} value={tollBooth}>{tollBooth}</option>))
    const history = this.state.history
      .map((history, index) => (<tr key={index}>
                                  <td>{history.event}</td>
                                  <td>{history.args.entryBooth || history.args.exitBooth }</td>
                                  <td>{history.args.depositedWeis ? history.args.depositedWeis.toString() : ''}</td>
                                  <td>{history.blockNumber.toString()}</td>
                                </tr>))
    const button = this.state.vehicleChecked ? (<Button bsStyle='success' disabled={this.state.disabled}
                                                        onClick={this.reset.bind(this)}>Reset</Button>)
                                            : (<Button bsStyle='success' disabled={this.state.disabled}
                                                       onClick={this.checkVehicle.bind(this)}>Check vehicle</Button>)
    return (
      <div style={{ margin: 10 }}>
        <p/>

        <Grid>
          <Row>
            <Col>
              <Label bsStyle='warning'>{this.state.disabled ? 'Loading... please, wait' : ''}</Label>
              <Label bsStyle='danger'>{this.state.vehicleMessage}</Label><br/>
            </Col>
          </Row>
          <Row>
            <Col xs={8} md={10}>
              <FormGroup
                controlId='vehicle' >
                <ControlLabel>Vehicle</ControlLabel>
                <FormControl
                  type='text'
                  disabled={this.state.vehicleChecked || this.state.disabled}
                  value={this.state.vehicle}
                  placeholder='Enter your vehicle address, which is registered in a system'
                  onChange={ this.handleChange.bind(this) }/>
                <Label bsStyle='default'>{'balance: ' + this.state.balance}</Label>
              </FormGroup>
            </Col>
            <Col xs={4} md={2}>
              <br/>
              {button}
            </Col>
          </Row>
          <Row className='show-grid'>
            <Col xs={12} md={10}>
              <FormGroup controlId='operator' bsClass={hidden([this.state.vehicleChecked])}>
                <ControlLabel>Select operator</ControlLabel>
                <FormControl componentClass='select' placeholder='select' onChange={ this.selectOperator.bind(this) }
                             disabled={this.state.disabled}>
                  <option value={''}>Select</option>
                  {availableOperators}
                </FormControl>
              </FormGroup>
            </Col>
          </Row><Row>
            <Col xs={12} md={10}>
              <FormGroup controlId='selectedTollBooth' bsClass={hidden([this.state.vehicleChecked, this.state.operator])}>
                <ControlLabel>Select entry booth</ControlLabel>
                <FormControl componentClass='select' placeholder='select' onChange={ this.selectEntryBooth.bind(this) }
                             disabled={this.state.disabled}>
                  <option value={''}>Select booth</option>
                  {availableTollBooths}
                </FormControl>
              </FormGroup>
            </Col>
        </Row><Row>
            <Col xs={6} md={6}>
              <FormGroup
                controlId='deposit' bsClass={hidden([this.state.vehicleChecked, this.state.operator, this.state.selectedEntryBooth])}>
                <ControlLabel>Deposit</ControlLabel>
                <FormControl
                  type='number'
                  value={this.state.deposit}
                  placeholder='Enter deposit'
                  onChange={this.handleChange.bind(this)}/>
                  <Label bsStyle='default'>{'Required deposit: ' + this.state.requiredDeposit}</Label>
              </FormGroup>
            </Col>
        </Row><Row>
            <Col xs={6} md={6}>
              <FormGroup
                controlId='secret' bsClass={hidden([this.state.vehicleChecked, this.state.operator, this.state.selectedEntryBooth])}>
                <ControlLabel>Secret</ControlLabel>
                <FormControl
                  type='text'
                  value={this.state.secret}
                  placeholder='Enter secret'
                  onChange={this.handleChange.bind(this)}/>
              </FormGroup>
            </Col>
        </Row><Row>
            <Col xs={6} md={6}>
              <FormGroup
                controlId='gas' bsClass={hidden([this.state.vehicleChecked, this.state.operator, this.state.selectedEntryBooth])}>
                <ControlLabel>Gas</ControlLabel>
                <FormControl
                  type='text'
                  value={this.state.gas}
                  placeholder='Enter gas'
                  onChange={this.handleChange.bind(this)}/>
              </FormGroup>
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={12}>
              <span className={hidden([this.state.vehicleChecked, this.state.operator, this.state.selectedEntryBooth])}>
              <Button bsStyle='success' disabled={this.state.disabled}

                    onClick={this.enterRoad.bind(this)}>Enter road</Button>
              </span>
            </Col>
          </Row>
        </Grid>
        <p/>
        <div className={hidden([this.state.vehicleChecked, this.state.operator, this.state.selectedEntryBooth])}>
        <Panel id='collapsible-panel-example-1'>
          <Panel.Heading>
            <Panel.Title>
              History
            </Panel.Title>
          </Panel.Heading>
            <Panel.Body>
              <Table striped bordered condensed hover>
                <thead>
                <tr>
                  <th>Activity</th>
                  <th>Booth</th>
                  <th>Deposit</th>
                  <th>Block number</th>
                </tr>
                </thead>
                <tbody>
                {history}
                </tbody>
              </Table>
            </Panel.Body>
        </Panel>
        </div>
      </div>
    )
  }
}

export default VehicleComponent
