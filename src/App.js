import React, {Component} from 'react'
import { 
  Container, 
  Button, 
  List, ListItem, ListItemIcon, ListItemText,
} from '@material-ui/core'

import CameraIcon from '@material-ui/icons/Camera';

import AWS from 'aws-sdk';

import { withAuthenticator } from 'aws-amplify-react'
import Amplify, { Auth } from 'aws-amplify'

let awsconfig = {
  Auth: {
    identityPoolId: "us-west-2:f533019d-9cbe-4a39-ad43-574c7316ad26",
    region: "us-west-2",
    userPoolId: "us-west-2_d9YBsfCk1",
    userPoolWebClientId: "54n46fo7gq5vprpg74qo4b8825",
    mandatorySignIn: true,
    oauth: {
      domain: "braingeneers.auth.us-west-2.amazoncognito.com",
      scope: ["email", "openid"],
      redirectSignIn: "http://localhost:3000/",
      redirectSignOut: "http://localhost:3000/",
      responseType: "token"
    }
  }
}
Amplify.configure(awsconfig)


// AWS.config.credentials = new AWS.CognitoIdentityCredentials({
// });

class App extends Component {
  state = {
    user: null,
    iot: null,
    things: null,
    loaded: false,
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

    this.setState({ iot: new AWS.Iot()})
    this.setState({ things: await this.state.iot.listThings().promise() })

    this.setState({ loaded: true })
  }

  render() {
    if (!this.state.loaded) return (<div>Loading...</div>)

    return (
      <Container>
        <Button onClick={() => Auth.signOut()}>Sign Out {this.state.user.getUsername()}</Button>
        <List>
        {this.state.things.things.map(thing =>
          <ListItem key={thing.thingArn}>
            <ListItemIcon>
              <CameraIcon />
            </ListItemIcon>
            <ListItemText primary={thing.thingName} />
            <Button>Start</Button>
            <Button>Stop</Button>
          </ListItem>
        )}
        </List>
      </Container>
    )
  }
}

export default withAuthenticator(App);
