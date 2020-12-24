import React from 'react';
import * as styles from './Message.module.css';
import * as utilities from '../../../containers/utility/utility';
import * as timeago from 'timeago.js';

const Message = props => {
    return (
        <div className={[styles['message'], styles[props.type]].join(' ')}>
            <div className={styles['user-wrapper']}>
                <div className={styles['user']}>
                    <img alt='' src={props.cover}></img>
                    <div className={styles['']}>
                        <div className={styles['status-and-name']}>
                            <h4 className={styles[props.status === 0 && props.type !== 'me' ? 'offline' : '']}>{props.name}</h4>
                        </div>
                        <span className={styles['time']}>{utilities.capitalizeFirstLetter(timeago.format(props.created_at))} </span>
                    </div>
                </div>
                <div className={styles['user-chat']}>
                    <p className={styles['message']}>{props.content}</p>
                </div>
            </div>
        </div>
    )
}

export default Message;
