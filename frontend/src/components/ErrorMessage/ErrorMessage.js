import React from 'react';
import * as styles from './ErrorMessage.module.css';

const ErrorMessage = props => {
    return (
        <div className={[styles['error-message'], styles[props.customStyle]].join(' ')}>

        </div>
    )
}

export default ErrorMessage;
