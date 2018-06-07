import React, { Component } from 'react'
import Panel from 'react-bootstrap/lib/Panel'
import Grid from 'react-bootstrap/lib/Grid'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import ControlLabel from 'react-bootstrap/lib/ControlLabel'
import FormControl from 'react-bootstrap/lib/FormControl'
import Button from 'react-bootstrap/lib/Button'
import Label from 'react-bootstrap/lib/Label'
import { CONFIG } from '../util/config'
import * as Web3Service from '../service/Web3Service'
import { hidden } from '../service/Web3Service'

class TollBoothComponent extends Component {

  constructor (props) {
    super(props)
    this.state = {
      gas: CONFIG.DEFAULT_GAS_LIMIT,
      vehicle: '',
      operator: '',
      secret: '',
      secretForInfo: '',
      infoText: '',
      availableOperators: [],
      selectedBooth: '',
      disabled: true,
      tollBooths: []
    }
  }

  async componentWillMount () {
    const availableOperators = await Web3Service.getOperators()
    this.setState({
      ...this.state,
      availableOperators,
      disabled: false
    })
  }

  async loadSecretInformation () {
    console.log("load")
    await Web3Service.getExitRoadInformation(this.state.operator, this.state.secretForInfo, async (exitInfo) => {
      let infoText
      if (exitInfo.length > 0) {
        infoText = `Vehicle exited: ${exitInfo[0].args.exitBooth} with refund ${exitInfo[0].args.refundWeis}`
        this.setState({ ...this.state, infoText })
      } else {
        await Web3Service.getPendingPayment(this.state.operator, this.state.secretForInfo, async (pendingInfo) => {
          if (pendingInfo.length > 0) {
            infoText = `Pending payment: Entry boot: ${pendingInfo[0].args.entryBooth} and Exit booth: ${pendingInfo[0].args.exitBooth}`
          } else {
            infoText = 'nothing found'
          }
          this.setState({ ...this.state, infoText })
        })
      }
    })
  }

  handleChange (e) {
    this.setState({ ...this.state, [e.target.id]: e.target.value })
  }

  async selectOperator (e) {
    await this.loadOperatorDetails(e.target.value)
  }

  async selectEntryBooth (e) {
    const selectedBooth = e.target.value
    const requiredDeposit = await Web3Service.getRequiredDeposit(this.state.operator)
    this.setState({ ...this.state, selectedBooth, requiredDeposit })
  }

  setDisabled (disabled = true) {
    this.setState({
      ...this.state,
      disabled: disabled
    })
  }

  async exitRoad () {
    this.setDisabled()
    const isPaused = await Web3Service.isOperatorPaused(this.state.operator)
    if (!isPaused) {
      await Web3Service.exitRoad(this.state.operator, this.state.selectedBooth,
        this.state.secret, this.state.gas)
    } else {
      alert('Operator is paused. Operator owner can change status on operator screen')
    }
    this.setDisabled(false)
  }

  async loadOperatorDetails (operator) {
    if (operator !== '') {
      this.setDisabled()
      const tollBooths = await Web3Service.getTollBooths(operator)

      this.setState({
        ...this.state,
        tollBooths,
        operator,
        disabled: false
      })
    }
  }
  render () {
    const availableOperators = this.state.availableOperators
      .map(op => (<option key={op.operator} value={op.operator}>{op.operator}</option>))
    const availableTollBooths = this.state.tollBooths
      .map(tollBooth => (<option key={tollBooth} value={tollBooth}>{tollBooth}</option>))

    return (
      <div style={{ margin: 10 }}>
        <p/>
        <Grid>
          <Row>
            <Col>
              <Label bsStyle='warning'>{this.state.disabled ? 'Loading... please, wait' : ''}</Label>
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
              </FormGroup>
            </Col>
          </Row><Row>
          <Col xs={12} md={10}>
            <FormGroup controlId='selectedTollBooth' bsClass={hidden([this.state.operator])}>
              <ControlLabel>Select booth</ControlLabel>
              <FormControl componentClass='select' placeholder='select' onChange={ this.selectEntryBooth.bind(this) }
                           disabled={this.state.disabled}>
                <option value={''}>Select booth</option>
                {availableTollBooths}
              </FormControl>
            </FormGroup>
          </Col>
        </Row><Row>
          <Col xs={12} md={10}>
            <FormGroup
              controlId='secret' bsClass={hidden([this.state.operator, this.state.selectedBooth])}>
              <ControlLabel>Vehicle secret</ControlLabel>
              <FormControl
                type='text'
                value={this.state.secret}
                placeholder='Enter vehicle secret'
                onChange={ this.handleChange.bind(this) }/>
            </FormGroup>
          </Col>
        </Row><Row>
          <Col xs={6} md={6}>
            <FormGroup
              controlId='gas' bsClass={hidden([this.state.operator, this.state.selectedBooth])}>
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
            <Col md={12}>
              <br/>
              <span className={hidden([this.state.operator, this.state.selectedBooth])}>
              <Button bsStyle='success' disabled={this.state.disabled}
                    onClick={this.exitRoad.bind(this)}>Report exit</Button>
              </span>
            </Col>
          </Row>
        </Grid>
        <p/>
        <div className={hidden([this.state.operator, this.state.selectedBooth])}>
        <Panel id='collapsible-panel-example-1'>
          <Panel.Heading>
            <Panel.Title toggle>
              Information
            </Panel.Title>
          </Panel.Heading>
            <Panel.Body>
             <Grid>
              <Row>
                <Col md={1}><label>Secret</label></Col>
                <Col md={8}>
              <FormGroup
                controlId='secretForInfo' >
                <FormControl
                  type='text'
                  value={this.state.secretForInfo}
                  placeholder='Enter secret'
                  onChange={this.handleChange.bind(this)}/>
              </FormGroup>
                </Col>
                <Col md={2}>
              <Button bsStyle='success' disabled={this.state.disabled}
                      onClick={this.loadSecretInformation.bind(this)}>Show details</Button>
                </Col>
              </Row>
               <Row>
             <Col md={12}>
              {this.state.infoText}
            </Col>
        </Row>
      </Grid>
            </Panel.Body>
        </Panel>
        </div>
      </div>
    )
  }
}

export default TollBoothComponent
