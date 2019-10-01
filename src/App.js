import React, {Component} from 'react'
import { 
  Container, 
  Button, 
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
        "http://localhost:3000/" : "https://www.braingeneers.org/things/",
      redirectSignOut: (window.location.hostname === "localhost") ? 
        "http://localhost:3000/" : "https://www.braingeneers.org/things/",
      responseType: "token"
    }
  }
}
Amplify.configure(awsconfig)

class App extends Component {
  state = {
    user: null,
    iot: null,
    things: null,
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
      <Container>
        <Button variant="outlined"
          onClick={() => Auth.signOut()}>Sign Out</Button>
        Not authorized
      </Container>
    )

    return (
      <Container>
        <Button variant="outlined"
          onClick={() => Auth.signOut()}>Sign Out</Button>
        <List>
        {this.state.things.things.map(thing =>
          <ListItem key={thing.thingArn}>
            <ListItemIcon>
              <CameraIcon />
            </ListItemIcon>
            <ListItemText primary={thing.thingName} />
            <Button variant="outlined" color="primary" 
              onClick={() => this.publish(thing.thingName, "start", {})}>Start</Button>
            <Button variant="outlined" color="secondary" 
              onClick={() => this.publish(thing.thingName, "stop", {})}>Stop</Button>
          </ListItem>
        )}
        </List>
      </Container>
    )
  }
}

export default withAuthenticator(App)