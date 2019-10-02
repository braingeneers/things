import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// const federated = {
//   google_client_id: "607661505432-26s3lvbo6bmtsqd94kvie5hkr18f79mp.apps.googleusercontent.com"
// };
// ReactDOM.render(<App federated={federated} />,document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
