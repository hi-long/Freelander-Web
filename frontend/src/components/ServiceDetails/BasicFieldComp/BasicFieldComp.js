import React from 'react';
import * as styles from './BasicFieldComp.module.css';

const BasicFieldComp = props => {

    return (
        <div className={styles['basic-field']}>
            <h4>{props.header}</h4>
            <p>{props.children}</p>
        </div>
    )
}

export default BasicFieldComp;
