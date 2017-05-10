// @flow

import React from 'react'
import Api from './api'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import TextField from 'material-ui/TextField'
import DatePicker from 'material-ui/DatePicker'
import TimePicker from 'material-ui/TimePicker'
import RaisedButton from 'material-ui/RaisedButton'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

type Props = {
  candidate: string,
  onRequestClose: () => void
}

type State = {
  submitStatus: 'NotAsked' | 'Pending' | 'Success' | 'Failure',
  details: {
    name: string,
    intro: string,
    hostName: string,
    hostEmail: string,
    hostPhone: string,
    date: Date,
    startTime: Date,
    endTime: Date
  },
  venue: {
    name: string,
    address: string,
    city: string,
    state: string
  },
}

const initialState : State = {
  details: {
    name: '',
    intro: '',
    hostName: '',
    hostEmail: '',
    hostPhone: '',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
  },
  venue: {
    name: '',
    address: '',
    city: '',
    state: '',
  },
  submitStatus: 'NotAsked'
}

export default class NewEventForm extends React.Component<void, Props, State> {
  state = initialState

  container: ?HTMLElement

  reset = () => {
    this.setState(initialState)
  }

  updateDetails = (property: string) => (_: any, newValue: string | Date) => {
    this.setState({ details: { ...this.state.details, [property]: newValue } })
  }

  updateVenue = (property: string) => (_: any, newValue: string) => {
    this.setState({ venue: { ...this.state.venue, [property]: newValue } })
  }

  submit = (event: Event) => {
    event.preventDefault()
    console.log(this.state);
    this.setState({ submitStatus: 'Pending' })
    // Api.create.event({
    //   name: this.state.details.name,
    //   intro: this.state.details.intro,
    //   host_name: this.state.details.hostName,
    //   host_email: this.state.details.hostEmail,
    //   host_phone: this.state.details.hostPhone,
    //   start_time: this.state.details.startTime.toISOString(),
    //   end_time: this.state.details.endTime.toISOString(),
    //   venue: this.state.venue
    // })
    new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.8 ? reject() : resolve()
      }, 2000)
    })
    .then(() => {
      this.setState({ submitStatus: 'Success' })
      this.props.onRequestClose()
    })
    .catch(() => {
      this.setState({ submitStatus: 'Failure' })
    })
  }

  renderDetailsInput(type: string, label: string, property: string, placeholder: string) {
    return (
      <div>
        {(type === 'text' || type === 'textarea') &&
          <TextField
            name={property}
            value={this.state.details[property]}
            onChange={this.updateDetails(property)}
            floatingLabelText={label}
            multiLine={type === 'textarea'}
            fullWidth
          />
        }
        {type === 'date' &&
          <DatePicker
            name={property}
            autoOk
            floatingLabelText={label}
            value={this.state.details[property]}
            onChange={this.updateDetails(property)}
            fullWidth
          />
        }
        {type === 'time' &&
          <TimePicker
            name={property}
            floatingLabelText={label}
            value={this.state.details[property]}
            onChange={this.updateDetails(property)}
            fullWidth
          />
        }
      </div>
    )
  }

  renderVenueInput(label: string, property: string, placeholder: string) {
    return (
      <div>
        <TextField
          name={property}
          value={this.state.venue[property]}
          onChange={this.updateVenue(property)}
          floatingLabelText={label}
          fullWidth
        />
      </div>
    )
  }

  render() {
    return (
      <MuiThemeProvider>
        <div
          ref={el => this.container = el}
          className="newEventModal"
          onClick={(e) => {
            if (e.target === this.container) {
              this.props.onRequestClose()
            }
          }}
        >
          <form
            className="newEventForm"
            onSubmit={this.submit}
          >
            <div className="newEventInputs">
              <div className="newEventDetails">
                <h3>Event Details</h3>
                {this.renderDetailsInput('text', 'Event Name', 'name', 'What is the name of the event?')}
                {this.renderDetailsInput('textarea', 'Intro', 'intro', 'What should people know about the event?')}
                {this.renderDetailsInput('text', 'Host Name', 'hostName', 'Who is hosting the event?')}
                {this.renderDetailsInput('text', 'Host Email', 'hostEmail', 'Where can we contact the host by email?')}
                {this.renderDetailsInput('text', 'Host Phone', 'hostPhone', 'Where can we contact the host by phone?')}
                {this.renderDetailsInput('date', 'Event Date', 'date', '')}
                {this.renderDetailsInput('time', 'Start Time', 'startTime', '')}
                {this.renderDetailsInput('time', 'End Time', 'endTime', '')}
              </div>

              <div className="newEventVenue">
                <h3>Venue Details</h3>
                {this.renderVenueInput('Venue Name', 'name', 'What is the name of the venue?')}
                {this.renderVenueInput('Address', 'address', 'What is the venue address?')}
                {this.renderVenueInput('City', 'city', 'In what city is the venue located?')}
                {this.renderVenueInput('State', 'state', 'In what state is the venue located?')}
              </div>
            </div>

            <div className="newEventActions">
              <div className="buttonContainer">
                <RaisedButton onClick={this.submit} fullWidth>Submit</RaisedButton>
              </div>
              <div className="buttonContainer">
                <RaisedButton onClick={() => this.props.onRequestClose()} fullWidth>Cancel</RaisedButton>
              </div>
            </div>
          </form>
        </div>
      </MuiThemeProvider>
    )
  }
}
