import React from 'react';
import * as styles from './Loading.module.css';

const Loading = props => {
    return (
        <div className={styles['loading']}>
            <div className={styles['load-icon']}>
                <div className={styles['line']}></div>
                <div className={styles['line']}></div>
                <div className={styles['line']}></div>
            </div>
            <h2>{props.children}</h2>
        </div>
    )
}

export default Loading;
