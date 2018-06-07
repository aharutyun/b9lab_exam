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

class TollBoothOperatorComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      gas: CONFIG.DEFAULT_GAS_LIMIT,
      operator: '',
      operatorOwner: '',
      availableOperators: [],
      availableVehicleTypes: [],
      newVehicleType: '',
      multiplier: 1,
      newTollBooth: '',
      fromBooth: '',
      toBooth: '',
      routePrice: 0,
      disabled: true,
      tollBooths: [],
      multipliers: [],
      pricedRoutes: [],
      isPaused: false
    }
  }

  async componentWillMount () {
    const availableOperators = await Web3Service.getOperators()
    const availableVehicleTypes = await Web3Service.getVehicleTypes()
    this.setState({
      ...this.state,
      availableOperators,
      availableVehicleTypes,
      disabled: false,
      isPaused: false
    })
  }

  setDisabled () {
    this.setState({
      ...this.state,
      disabled: true
    })
  }

  async resumeOperator (e) {
    await Web3Service.setPaused(this.state.operator, false, this.state.operatorOwner, this.state.gas )
    const isPaused = await Web3Service.isOperatorPaused(this.state.operator)
    this.setState({ ...this.state, isPaused })
  }

  async stopOperator (e) {
    await Web3Service.setPaused(this.state.operator, true, this.state.operatorOwner, this.state.gas )
    const isPaused = await Web3Service.isOperatorPaused(this.state.operator)
    this.setState({ ...this.state, isPaused })
  }

  async loadOperatorDetails (operator) {
    if (operator !== '') {
      this.setDisabled()
      const operatorOwner = await Web3Service.getOperatorOwner(operator)
      console.log('Owner success')
      const multipliers = await Web3Service.getMultipliers(operator)
      console.log('Multipliers success')
      const pricedRoutes = await Web3Service.getPricedRoutes(operator)
      console.log('pricedRoutes success')
      const tollBooths = await Web3Service.getTollBooths(operator)
      console.log('Toll booth success')

      const isPaused = await Web3Service.isOperatorPaused(operator)

      this.setState({
        ...this.state,
        tollBooths,
        multipliers,
        pricedRoutes,
        operatorOwner,
        operator,
        isPaused,
        disabled: false
      })
    } else this.setState({ ...this.state, operator })
  }

  async addNewTollBooth () {
    this.setDisabled()
    await Web3Service.addTollBooth(this.state.newTollBooth,
                                   this.state.operator,
                                   this.state.operatorOwner,
                                   this.state.gas)
    this.setState({
      ...this.state,
      tollBooths: await Web3Service.getTollBooths(this.state.operator),
      disabled: false
    })
  }

  async selectVehicleType (e) {
    this.setState({ ...this.state, newVehicleType: e.target.value })
  }

  async selectOperator (e) {
    await this.loadOperatorDetails(e.target.value)
  }

  async setMultiplier () {
    this.setDisabled()
    await Web3Service.setMultiplier(this.state.operator, this.state.newVehicleType,
              this.state.multiplier, this.state.operatorOwner, this.state.gas)

    this.setState({
      ...this.state,
      multipliers: await Web3Service.getMultipliers(this.state.operator),
      disabled: false
    })
  }

  async setNewPrice () {
    this.setDisabled()
    await Web3Service.setRoutePrice(this.state.operator, this.state.routePrice,
                                    this.state.fromBooth, this.state.toBooth, this.state.operatorOwner, this.state.gas)
    this.setState({
      ...this.state,
      pricedRoutes: await Web3Service.getPricedRoutes(this.state.operator),
      disabled: false
    })
  }

  async selectEntryBooth (e) {
    const fromBooth = e.target.value
    this.setState({ ...this.state, fromBooth })
  }

  async selectExitBooth (e) {
    const toBooth = e.target.value
    this.setState({ ...this.state, toBooth })
  }

  handleChange (e) {
    this.setState({ ...this.state, [e.target.id]: e.target.value })
  }

  render () {
    const availableOperators = this.state.availableOperators
      .map(op => (<option key={op.operator} value={op.operator}>{op.operator}</option>))
    const tollBooths = this.state.tollBooths.map(address => (<tr key={address}><td>{address}</td></tr>))
    const availableTollBooths = this.state.tollBooths
      .map(tollBooth => (<option key={tollBooth} value={tollBooth}>{tollBooth}</option>))
    const routePrices = this.state.pricedRoutes.map((route, index) => (<tr key={index}>
      <td>{route.from}</td>
      <td>{route.to}</td>
      <td>{route.price}</td>
    </tr>))
    const availableVehicleTypes = this.state.availableVehicleTypes
      .map(type => (<option key={type} value={type}>{type}</option>))

    const multipliers = this.state.multipliers.map((m, index) => (
      <tr key={index}>
        <td>{m.vehicleType}</td>
        <td>{m.value}</td>
      </tr>
    ))
    const operatorDetails = this.state.operator === '' ? '' : (<div>
      <Panel id='collapsible-panel-example-1'>
        <Panel.Heading>
          <Panel.Title toggle>
            Toll booth management
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Grid>
              <Row className='show-grid'>
                <Col xs={8} md={6}>
                  <FormGroup
                    controlId='newTollBooth' >
                    <FormControl
                      type='text'
                      value={this.state.newTollBooth}
                      placeholder='Enter booth address'
                      onChange={this.handleChange.bind(this)}/>
                  </FormGroup>
                </Col>
                <Col xs={4} md={4}>
                  <Button bsStyle='success' disabled={this.state.disabled}
                          onClick={this.addNewTollBooth.bind(this)}>Add booth</Button>
                </Col>
              </Row>
            </Grid>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>Address</th>
              </tr>
              </thead>
              <tbody>
              {tollBooths}
              </tbody>
            </Table>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
      <Panel id='collapsible-panel-example-1' >
        <Panel.Heading>
          <Panel.Title toggle>
            Route price management
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Grid>
              <Row className='show-grid'>
                <Col xs={12} md={4}>
                  <FormGroup controlId='fromBooth'>
                    <ControlLabel>Select entry booth</ControlLabel>
                    <FormControl componentClass='select' placeholder='select' onChange={ this.selectEntryBooth.bind(this) }
                                 disabled={this.state.disabled}>
                      <option value={''}>Select booth</option>
                      {availableTollBooths}
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={12} md={4}>
                  <FormGroup controlId='toBooth'>
                    <ControlLabel>Select exit booth</ControlLabel>
                    <FormControl componentClass='select' placeholder='select' onChange={ this.selectExitBooth.bind(this) }
                                 disabled={this.state.disabled}>
                      <option value={''}>Select booth</option>
                      {availableTollBooths}
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={12} md={2}>
                  <FormGroup
                    controlId='routePrice' >
                    <ControlLabel>Price</ControlLabel>
                    <FormControl
                      type='number'
                      value={this.state.routePrice}
                      placeholder='Enter price'
                      onChange={this.handleChange.bind(this)}/>
                  </FormGroup>
                </Col>
                <Col xs={12} md={2}>
                  <br/>
                  <Button bsStyle='success' disabled={this.state.disabled}
                          onClick={this.setNewPrice.bind(this)}>Set price</Button>
                </Col>
              </Row>
            </Grid>
            <p/>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>From booth</th>
                <th>To booth</th>
                <th>Price</th>
              </tr>
              </thead>
              <tbody>
              {routePrices}
              </tbody>
            </Table>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
      <Panel id='collapsible-panel-example-1' >
        <Panel.Heading>
          <Panel.Title toggle>
            Multipliers management
          </Panel.Title>
        </Panel.Heading>
        <Panel.Collapse>
          <Panel.Body>
            <Grid>
              <Row className='show-grid'>
                <Col xs={12} md={5}>
                  <FormGroup controlId='operator'>
                    <ControlLabel>Vehicle type</ControlLabel>
                    <FormControl componentClass='select' placeholder='select vehicle type'
                                 onChange={ this.selectVehicleType.bind(this) }
                                 disabled={this.state.disabled}>
                      <option value={''}>Select vehicle type</option>
                      {availableVehicleTypes}
                    </FormControl>
                  </FormGroup>
                </Col>
                <Col xs={12} md={5}>
                  <FormGroup
                    controlId='multiplier' >
                    <ControlLabel>Multiplier</ControlLabel>
                    <FormControl
                      type='number'
                      value={this.state.multiplier}
                      placeholder='Enter multiplier'
                      onChange={this.handleChange.bind(this)}/>
                  </FormGroup>
                </Col>
                <Col xs={12} md={2}>
                  <br/>
                  <Button bsStyle='success' disabled={this.state.disabled}
                          onClick={this.setMultiplier.bind(this)}>Set multiplier</Button>
                </Col>
              </Row>
            </Grid>
            <br/>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>Vehicle type</th>
                <th>Multiplier</th>
              </tr>
              </thead>
              <tbody>
              {multipliers}
              </tbody>
            </Table>
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    </div>)
    return (
      <div style={{ margin: 10 }}>
        <p/>
        <Grid>
          <Row>
            <Col xs={9} md={10}>
              <Label bsStyle='warning'>{this.state.disabled ? 'Loading... please, wait' : ''}</Label>
            </Col>
            <Col xs={1} md={1}>
              <Button disabled={this.state.operator === '' || !this.state.isPaused}
                      onClick={this.resumeOperator.bind(this)}>Resume</Button>
            </Col>
            <Col xs={1} md={1}>
              <Button disabled={this.state.operator === '' || this.state.isPaused}
                      onClick={this.stopOperator.bind(this)}>Stop</Button>
            </Col>
          </Row>
          <Row className='show-grid'>
            <Col xs={12} md={10}>
              <FormGroup controlId='operator'>
                <ControlLabel>Select operator</ControlLabel>
                <FormControl componentClass='select' placeholder='select' onChange={ this.selectOperator.bind(this) }
                             disabled={this.state.disabled}>
                  <option value={''}>Select</option>
                  {availableOperators}
                </FormControl>
                <Label bsStyle='default'>{'Owner: ' + this.state.operatorOwner}</Label>
              </FormGroup>
            </Col>
            <Col xs={6} md={2}>
              <FormGroup
                controlId='gas' >
                <ControlLabel>Gas</ControlLabel>
                <FormControl
                  type='text'
                  value={this.state.gas}
                  placeholder='Enter gas'
                  onChange={this.handleChange.bind(this)}/>
              </FormGroup>
            </Col>
          </Row>
        </Grid>
        {operatorDetails}
      </div>
    )
  }
}

export default TollBoothOperatorComponent
