import React from 'react';
import * as styles from './OnlineStatus.module.css';

const OnlineStatus = props => {
    const imgSrc = props.status ? 'online.png' : 'offline.png';
    return (
        <span className={[styles['online-status'], styles[props.customStyle]].join(' ')}>
            <img alt='' src={process.env.PUBLIC_URL + '/images/OnlineStatus/' + imgSrc}></img>
        </span>
    )
}

export default OnlineStatus;

