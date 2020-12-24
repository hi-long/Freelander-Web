import React from 'react';
import * as styles from './Notification.module.css';

const Notification = props => {
    return (
        <div className={[styles['notification'], styles[props.type]].join(' ')}>
            <div className={styles['noti-icon']}>
                <img onClick={props.clicked} alt='' src={process.env.PUBLIC_URL + `/images/Notification/${props.type}.png`}></img>
            </div>
            <h2>{props.children}</h2>
        </div>
    )
}

export default Notification;
