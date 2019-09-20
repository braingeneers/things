import React, {Component} from 'react'
import './App.css';

import Amplify, { Auth } from 'aws-amplify';

/*
 
https://braingeneers.auth.us-west-2.amazoncognito.com/login?response_type=code&client_id=54n46fo7gq5vprpg74qo4b8825&redirect_uri=http://localhost:18500

https://braingeneers.auth.us-west-2.amazoncognito.com/signout

*/

Amplify.configure({
  Auth: {

    // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
    identityPoolId: 'us-west-2:f533019d-9cbe-4a39-ad43-574c7316ad26',

    // REQUIRED - Amazon Cognito Region
    region: 'us-west-2',

    // OPTIONAL - Amazon Cognito User Pool ID
    userPoolId: 'us-west-2_d9YBsfCk1',

    // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    userPoolWebClientId: '54n46fo7gq5vprpg74qo4b8825',

    // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
    mandatorySignIn: true,

    oauth: {
      domain: 'braingeneers.auth.us-west-2.amazoncognito.com',
      scope: ['email', 'openid', 'profile'],
      redirectSignIn: 'http://localhost:18500',
      redirectSignOut: 'http://localhost:18500',
      responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
    }
  }
});

// Auth.federatedSignIn({provider: 'Google'});

class App extends Component {

  render() {
    return (
      <div className="App">
        <div>Hello World</div>
        <button onClick={() => Auth.federatedSignIn({provider: 'Google'})}>Open Google</button>
      </div>
    );
  }
}
export default App;
