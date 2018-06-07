import React, { Component } from 'react'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Table from 'react-bootstrap/lib/Table'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import FormControl from 'react-bootstrap/lib/FormControl'
import Label from 'react-bootstrap/lib/Label'
import Button from 'react-bootstrap/lib/Button'
import Panel from 'react-bootstrap/lib/Panel'
import * as Web3Service from '../service/Web3Service'
import { CONFIG } from '../util/config'

class RegulatorComponent extends Component {
  constructor (props, context) {
    super(props, context)

    this.handleChange = this.handleChange.bind(this)

    this.state = {
      newVehicleAddress: '',
      newVehicleType: '',
      gas: CONFIG.DEFAULT_GAS_LIMIT,
      regulatorAddress: CONFIG.accounts[0],
      newOperatorAddress: '',
      operatorDeposit: 0,
      vehicles: [],
      operators: [],
      buttonsDisabled: true
    }
  }

  async componentWillMount () {
    this.setState({
      ...this.state,
      vehicles: await Web3Service.getVehicles(),
      operators: await Web3Service.getOperators(),
      regulatorAddress: await Web3Service.getRegulatorOwner(),
      buttonsDisabled: false
    })
  }

  handleChange (e) {
    this.setState({ ...this.state, [e.target.id]: e.target.value })
  }

  async setNewVehicleType () {
    this.setState({ ...this.state, buttonsDisabled: true })
    await Web3Service.setVehicleType(this.state.newVehicleAddress,
                               this.state.newVehicleType,
                              this.state.regulatorAddress,
                              this.state.gas)
    this.setState({ ...this.state, vehicles: await Web3Service.getVehicles(), buttonsDisabled: false })
  }

  async createOperator() {
    this.setState({ ...this.state, buttonsDisabled: true })
    await Web3Service.createOperator(this.state.newOperatorAddress,
      this.state.operatorDeposit,
      this.state.regulatorAddress,
      this.state.gas)
    this.setState({ ...this.state,
                   operators: await Web3Service.getOperators(),
                   buttonsDisabled: false
                  })
  }

  render () {
    const vehicles = this.state.vehicles.map(vehicle => (
      <tr key={vehicle.vehicle}>
        <td>{vehicle.vehicle}</td>
        <td>{vehicle.vehicleType}</td>
      </tr>
    ))
    const operators = this.state.operators.map(operator => (
      <tr key={operator.operator}>
        <td>{operator.operator}</td>
        <td>
          { operator.isPaused + '' }
        </td>
      </tr>
    ))
    return (
      <Grid>
          <Row className='show-grid'>
            <Col md={6} lg={6}>
              <Label bsStyle='warning'>{this.state.buttonsDisabled ? 'Loading... please, wait' : ''}</Label>
            </Col>
            <Col md={6} lg={6}>
              <FormGroup
                controlId='gas'>
                <ControlLabel>Gas limit</ControlLabel>
                <FormControl
                  type='text'
                  value={this.state.gas}
                  placeholder='Enter gas'
                  onChange={this.handleChange}/>
              </FormGroup>
              <label>{'Regulator owner: ' + this.state.regulatorAddress}</label>
            </Col>
          </Row>
        <Row className='show-grid'>
          <Col xs={12} md={6} lg={6}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><b>Vehicles</b></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
            <Grid>
              <Row className='show-grid'>
                <Col xs={11} md={5} lg={5}>
                  <FormGroup
                    controlId='newVehicleAddress'>
                    <ControlLabel>New vehicle address</ControlLabel>
                    <FormControl
                      type='text'
                      value={this.state.newVehicleAddress}
                      placeholder='Enter address'
                      onChange={this.handleChange}/>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col xs={7} md={3} lg={3}>
                  <FormGroup
                  controlId='newVehicleType'>
                  <ControlLabel>New vehicle type</ControlLabel>
                  <FormControl
                    type='number'
                    value={this.state.newVehicleType}
                    placeholder='Enter type'
                    onChange={this.handleChange}/>
                </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Button bsStyle='success' disabled={this.state.buttonsDisabled}
                          onClick={this.setNewVehicleType.bind(this)}>Set vehicle type</Button>
                </Col>
              </Row>
            </Grid>
            <p/>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>Vehicle address</th>
                <th>Type</th>
              </tr>
              </thead>
              <tbody>
              {vehicles}
              </tbody>
            </Table>
                </Panel.Body>
            </Panel>
          </Col>
          <Col xs={12} md={6} lg={6}>
            <Panel>
              <Panel.Heading>
                <Panel.Title componentClass="h3"><b>Operators</b></Panel.Title>
              </Panel.Heading>
              <Panel.Body>
            <Grid>
              <Row className='show-grid'>
                <Col xs={11} md={5} lg={5}>
                  <FormGroup
                    controlId='newOperatorAddress'>
                    <ControlLabel>New operator address</ControlLabel>
                    <FormControl
                      type='text'
                      value={this.state.newOperatorAddress}
                      placeholder='Enter address'
                      onChange={this.handleChange}/>
                  </FormGroup>
                </Col>
              </Row>
              <Row className='show-grid'>
                <Col xs={7} md={3} lg={3}>
                  <FormGroup
                    controlId='operatorDeposit'>
                    <ControlLabel>Deposit</ControlLabel>
                    <FormControl
                      type='number'
                      value={this.state.operatorDeposit}
                      placeholder='Enter text'
                      onChange={this.handleChange}/>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col md={3} lg={3}>
                  <Button bsStyle='success' disabled={this.state.buttonsDisabled}
                          onClick={this.createOperator.bind(this)}>Create operator</Button>
                </Col>
              </Row>
            </Grid>
            <p/>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>Operator address</th>
                <th>Is paused</th>
              </tr>
              </thead>
              <tbody>
              {operators}
              </tbody>
            </Table>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default RegulatorComponent
