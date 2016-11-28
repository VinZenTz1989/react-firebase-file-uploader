import React, { Component } from 'react';
import FileUploader from 'react-firebase-file-uploader';
import firebase from 'firebase';
import './App.css';
import 'react-firebase-file-uploader/stylesheet.css';

firebase.initializeApp({
  apiKey: "AIzaSyAbh-LohgGv-fNjb8jjmKYB9LASi16FRSM",
  authDomain: "react-firebase-file-uploader.firebaseapp.com",
  storageBucket: "react-firebase-file-uploader.appspot.com",
});

const NiceButton = (props: {progress?: number, filename?: string, className?: string}) => (
  <div>
    <i className="fa fa-upload" aria-hidden="true"></i>{' '}
    {props.filename || 'Select a file...'}
    {(props.progress !== undefined) && ` (${Math.floor(props.progress)}%)`}
  </div>
);

class CustomInput extends Component {
  state = {};

  handleInputChange = (event) => {
    this.setState({filename: event.target.files[0].name});
    this.props.onChange(event);
  }

  render() {
    return (
      <div>
        {this.props.uploading && <h5>Uploading {this.state.filename} </h5>}
        {this.props.uploaded && <h5>Uploaded {this.state.filename}!</h5>}
        <input type="file" onChange={this.handleInputChange} />
      </div>
    );
  }
}

class App extends Component {
  state = {};

  componentDidMount() {
    firebase.auth().signInAnonymously();
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({authenticated: true});
      }
    });
  }

  render() {
    if (!this.state.authenticated) return null;
    return (
      <div>

        <h3>Standard input</h3>
        <FileUploader
          storageRef={firebase.storage().ref()}
        />

        <h3>Custom button with class name</h3>
        <FileUploader
          className="upload-button"
          focusClassName="has-focus"
          storageRef={firebase.storage().ref()}
          as={NiceButton}
        />

        <h3>Custom button with inline styles</h3>
        <FileUploader
          style={{
            padding: '10px 20px',
            color: 'indianred',
            fontWeight: 500,
            border: '2px solid indianred'
          }}
          hoverStyle={{
            backgroundColor: 'indianred',
            color: 'white'
          }}
          focusStyle={{
            backgroundColor: 'indianred',
            color: 'white'
          }}
          storageRef={firebase.storage().ref()}
          as={NiceButton}
        />

        <h3>Custom input element</h3>
        <FileUploader
          storageRef={firebase.storage().ref()}
          onUploadStart={() => this.setState({customInputIsUploading: true, customInputHasUploaded: false})}
          onUploadSuccess={() => this.setState({customInputIsUploading: false, customInputHasUploaded: true})}
          uploading={this.state.customInputIsUploading}
          uploaded={this.state.customInputHasUploaded}
          input={CustomInput}
        />
      </div>
    );
  }
}

export default App;
