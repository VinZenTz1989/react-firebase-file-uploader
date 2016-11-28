/**
 * FirebaseFileUploader for React
 * @flow
 */

import React, { Component } from 'react';
import { v4 as generateID } from 'uuid';
import newId from './utils';

function generateRandomFilename(currentFilename: string): string {
	const extension = /(?:\.([^.]+))?$/.exec(currentFilename)[0];
  return generateID() + extension;
}

type Props = {
	storageRef: Object,
	onUploadStart?: (file: Object) => void,
	onProgress?: (progress: number) => void,
	onUploadSuccess?: (filename: string) => void,
	onUploadError?: (error: FirebaseStorageError) => void,
  metadata?: Object,
  randomizeFilename?: boolean,
  as?: any,
  input?: any,
  id?: string,
  className?: string,
  focusClassName?: string,
  style?: any,
  hoverStyle?: any,
  focusStyle?: any,
  // default input props
  accept?: string,
  disabled?: boolean,
  form?: string,
  formNoValidate?: boolean,
  name?: string,
  readOnly?: boolean,
  required?: boolean,
  value?: string
};

type State = {
  progress?: number,
  filename?: string,
  focus?: boolean,
  hover?: boolean
};

export default class FirebaseFileUploader extends Component {
  state: State = {};
	props: Props;
	uploadTask: ?Object;
  input: ?Object;
  label: ?Object;
  id: ?string;

  componentWillMount() {
    this.id = newId('ffui');
  }

	cancelRunningUpload() {
		if (this.uploadTask) {
			if (this.uploadTask.snapshot.state === 'running') {
				this.uploadTask.cancel();
        this.uploadTask = null;
			}
		}
	};

	startUpload(file: Object) {
		// Cancel any running tasks
		this.cancelRunningUpload();

    const {
      onUploadStart,
      storageRef,
      metadata,
      randomizeFilename
    } = this.props;

		if (onUploadStart) {
			onUploadStart(file);
		}
    this.setState({filename: file.name, progress: 0});

    const filenameToUse = randomizeFilename ? generateRandomFilename(file.name) : file.name;

    this.uploadTask = storageRef.child(filenameToUse).put(file, metadata);
		this.uploadTask.on('state_changed',
      this.progressHandler,
      this.errorHandler,
      this.successHandler,
    );
	};

	progressHandler = (snapshot: Object) => {
		const progress = Math.round(100 * snapshot.bytesTransferred / snapshot.totalBytes);
    this.setState({progress});
		if (this.props.onProgress) {
			this.props.onProgress(progress);
		}
	};

	successHandler = () => {
		if (!this.uploadTask) {
			return;
		}
		const filename = this.uploadTask.snapshot.metadata.name;
		if (this.props.onUploadSuccess) {
			this.props.onUploadSuccess(filename);
		}
	};

	errorHandler = (error: FirebaseStorageError) => {
		if (this.props.onUploadError) {
			this.props.onUploadError(error);
		}
	};

	handleFileSelection = (event: Object) => {
    if (event.target.files[0]) {
		  this.startUpload(event.target.files[0]);
    }
	};

	render() {
		const {
      storageRef,
      onUploadStart,
      onProgress,
      onUploadSuccess,
      onUploadError,
      randomizeFilename,
      metadata,
      as,
      input,
      id,
      className,
      focusClassName,
      style,
      hoverStyle,
      focusStyle,
      ...props
		} = this.props;

    // Render customized input if provided
    if (input) {
      const Input = input;
      return (
        <Input
          onChange={this.handleFileSelection}
          {...props}
          id={id}
          className={className}
        />
      );
    }

    // Find custom label render options
    const LabelContent = as;
    const {
      hover,
      focus,
      ...labelContentProps
    } = this.state;

    let labelStyle = style || {};
    if (hover) {
      labelStyle = {...labelStyle, ...hoverStyle};
    }
    if (focus) {
      labelStyle= {...labelStyle, ...focusStyle};
    }
    const labelClassNames = [];
    if (className) {
      labelClassNames.push(className);
    }
    if (focus && focusClassName) {
      labelClassNames.push(focusClassName);
    }

    // Render input
    return (
      <div>
        <input
          type="file"
          onChange={this.handleFileSelection}
          className={LabelContent ? (focus ? 'ffui-hidden' : 'ffui-hidden ffui-hidden-focused') : ''}
          id={this.id}
          ref={(i) => { this.input = i; }}
          onFocus={() => this.setState({focus: true})}
          onBlur={() => this.setState({focus: false})}
          {...props}
        />
        {LabelContent &&
          <label
            htmlFor={this.id}
            className={labelClassNames.join(' ')}
            id={id}
            ref={(l) => { this.label = l; }}
            style={labelStyle}
            onMouseEnter={() => this.setState({hover: true})}
            onMouseLeave={() => this.setState({hover: false})}
          >
            {LabelContent && <LabelContent {...labelContentProps}/>}
          </label>
        }
      </div>
    );
	}
}