import React from 'react';
import * as  styles from './InputGroup.module.css';

const InputGroup = props => {
    return (
        <div className={styles[props.className]}>
            <label><b>{props.title}</b></label>
            {props.children}
        </div>
    )
}

export default InputGroup;