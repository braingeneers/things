import React, {Component} from 'react'

import {
  Container,
  Button,
  TextField,
  MenuItem,
  AppBar, Toolbar,
  List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core'
import CameraIcon from '@material-ui/icons/Camera';

import AWS from 'aws-sdk';
import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth, PubSub } from 'aws-amplify'
import { AWSIoTProvider } from '@aws-amplify/pubsub/lib/Providers';

let awsconfig = {
  Auth: {
    identityPoolId: "us-west-2:f533019d-9cbe-4a39-ad43-574c7316ad26",
    region: "us-west-2",
    userPoolId: "us-west-2_d9YBsfCk1",
    userPoolWebClientId: "54n46fo7gq5vprpg74qo4b8825",
    mandatorySignIn: true,
    oauth: {
      domain: "braingeneers.auth.us-west-2.amazoncognito.com",
      scope: ["email", "openid", "profile"],
      redirectSignIn: (window.location.hostname === "localhost") ?
        "http://localhost:3000/" : "https://braingeneers.gi.ucsc.edu/things/",
      redirectSignOut: (window.location.hostname === "localhost") ?
        "http://localhost:3000/" : "https://braingeneers.gi.ucsc.edu/things/",
      responseType: "token"
    }
  }
}
Amplify.configure(awsconfig)

const light_options = [
  {
    value: 'gfp',
    label: 'GFP',
  },
  {
    value: 'white',
    label: 'Bright Field',
  }
]
const camera_options = [
  {
    value: '-t 4000 -ss 2500000 -awb off -awbg 1,1 -o',
    label: 'GFP',
  },
  {
    value: '-t 4000 -awb off -awbg 1,1 -o',
    label: 'Bright Field',
  }
]
class App extends Component {

  state = {
    user: null,
    iot: null,
    things: null,
    uuid: new Date().toISOString().split('T')[0],
    interval: 2,
    stack_size: 5,
    stack_offset: 500,
    step_size: 100,
    camera_params: "-t 4000 -awb off -awbg 1,1 -o",
    light_mode: "white",
    loaded: false,
    authenticated: false,
  }

  async componentDidMount() {
    this.setState({ user: await Auth.currentAuthenticatedUser() })
    const credentials = await Auth.currentCredentials()
    AWS.config.update({
      region: awsconfig.Auth.region,
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken
    })
    try {
      const iot = new AWS.Iot({credentials: credentials})
      this.setState({ iot: iot })
      this.setState({ things: await this.state.iot.listThings().promise() })

      iot.attachPrincipalPolicy({
        policyName: 'default',
        principal: credentials.identityId
      }, (err, res) => {
        if (err) console.error(err);
      });

      Amplify.addPluggable(new AWSIoTProvider({
        aws_pubsub_region: awsconfig.Auth.region,
        aws_pubsub_endpoint: 'wss://ahp00abmtph4i-ats.iot.us-west-2.amazonaws.com/mqtt'
      }));

      PubSub.subscribe('picroscope/#').subscribe({
        next: data => console.log('Message received', data),
        error: error => console.error(error),
        close: () => console.log('Done'),
      });

      this.setState({ authenticated: true })
    } catch(error) {
      console.log("Unable to authenticate", error)
    }

    this.setState({ loaded: true })
  }

  async publish(thing, action, params={}) {
    console.log(`${thing}/${action}`, params)
    await PubSub.publish(`${thing}/${action}`, params)
  }

  render() {
    if (!this.state.loaded) return (<div>Loading...</div>)

    if (!this.state.authenticated) return (
      <div>
        <AppBar position="static">
            <Button color="inherit" onClick={() => Auth.signOut()}>Logout</Button>
        </AppBar>
        <Container>
          You're email address has not been authorized
        </Container>
			</div>
		)

    return (
      <form>
        <AppBar position="static">
          <Toolbar>
            <img src="logo36.png" alt="Braingeneers"/>
            <Button color="inherit" onClick={() => Auth.signOut()}>Logout</Button>
          </Toolbar>
        </AppBar>
        <TextField
          id="uuid"
          label="UUID"
          value={this.state.uuid}
          onChange={(e) => this.setState({ uuid: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="stack_size"
          label="Stack Size"
          value={this.state.stack_size}
          onChange={(e) => this.setState({ stack_size: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="step_size"
          label="Step Size"
          value={this.state.step_size}
          onChange={(e) => this.setState({ step_size: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="stack_offset"
          label="Step Offset"
          value={this.state.stack_offset}
          onChange={(e) => this.setState({ stack_offset: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="interval"
          label="Interval (hours)"
          value={this.state.interval}
          onChange={(e) => this.setState({ interval: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
          id="camera_params"
          label="Camera Command Parameters"
          value={this.state.camera_params}
          onChange={(e) => this.setState({ camera_params: e.target.value})}
          margin="normal"
          variant="outlined"
        />
        <TextField
         id="outlined-select-cam-params"
         select
         label="Camera Parameter Presets"
         value={this.state.camera_params}
         onChange={(e) => this.setState({ camera_params: e.target.value})}
         margin="normal"
         style = {{width: 190}}
         variant="outlined"
       >
         {camera_options.map(option => (
           <MenuItem key={option.value} value={option.value}>
             {option.label}
           </MenuItem>
         ))}
       </TextField>
        <TextField
         id="outlined-select-currency"
         select
         label="Light Type"
         value={this.state.light_mode}
         onChange={(e) => this.setState({ light_mode: e.target.value})}
         margin="normal"
         style = {{width: 190}}
         variant="outlined"
       >
         {light_options.map(option => (
           <MenuItem key={option.value} value={option.value}>
             {option.label}
           </MenuItem>
         ))}
       </TextField>
        <List>
        {this.state.things.things.map(thing =>
          <ListItem key={thing.thingArn}>
            <ListItemIcon>
              <CameraIcon />
            </ListItemIcon>
            <ListItemText primary={thing.thingName} />
            <Button variant="outlined" color="primary"
              onClick={() => this.publish(thing.thingName, "start", {"uuid": this.state.uuid, "params": {"interval":this.state.interval,"stack_size":this.state.stack_size, "stack_offset":this.state.stack_offset, "step_size":this.state.step_size,"camera_params":this.state.camera_params, "light_mode":this.state.light_mode}} )}>Start</Button>
            <Button variant="outlined" color="secondary"
              onClick={() => this.publish(thing.thingName, "stop", {})}>Stop</Button>
          </ListItem>
        )}
        </List>
      </form>

    )
  }
}

export default withAuthenticator(App)
