import React from 'react';
import * as styles from './Button.module.css';

const Button = props => {
    return (
        <button
            disabled={props.disabled}
            className={[styles.Button, styles[props.customStyle]].join(' ')}
            onClick={props.clicked}>
            {props.children}
        </button>
    )
}

export default Button;