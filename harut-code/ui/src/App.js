import React, { Component } from 'react'
import './App.css'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import {Route} from 'react-router-dom'
import RegulatorComponent from './component/RegulatorComponent'
import TollBoothOperatorComponent from './component/TollBootOperatorComponent'
import VehicleComponent from './component/VehicleComponent'
import TollBoothComponent from './component/TollBoothComponent'
import { CONFIG } from './util/config'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeScreen: this.props.location.pathname
    }
    console.log(CONFIG.accounts)
  }

  handleOnSelect (selectedScreen) {
    this.setState({ activeScreen: selectedScreen })
    this.props.history.push(selectedScreen)
  }

  render () {
    return (
      <div>
        <Nav bsStyle='tabs' activeKey={this.state.activeScreen} onSelect={this.handleOnSelect.bind(this)}>
          <NavItem eventKey='/regulator'>
            Regulator
          </NavItem>
          <NavItem eventKey='/toll-booth-operator'>
            Toll booth operator
          </NavItem>
          <NavItem eventKey='/vehicle'>
            Vehicle
          </NavItem>
          <NavItem eventKey='/toll-booth' >
            Toll booth
          </NavItem>
        </Nav>
        <Route path='/regulator' component={RegulatorComponent}/>
        <Route path='/toll-booth-operator' component={TollBoothOperatorComponent}/>
        <Route path='/vehicle' component={VehicleComponent}/>
        <Route path='/toll-booth' component={TollBoothComponent}/>
      </div>
    )
  }
}

export default App
