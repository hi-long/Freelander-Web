import React from 'react';
import * as styles from './BoxChat.module.css';
import * as timeago from 'timeago.js';
import { Link } from 'react-router-dom';

const BoxChat = props => {
    const conversationProps = props.conversation;
    const toProps = props.to
    return (
        <div onClick={() => { props.onEnterConversation({ conversation_id: conversationProps.conversation_id, ...toProps }); props.onConversationSeen(conversationProps.conversation_id) }}
            className={[styles['box-chat'], styles[props.selected ? 'selected' : '']].join(' ')
            }>
            <div className={styles['user']}>
                <Link to={`/${props.to.user_id}`}>
                    <img alt='' src={toProps.cover}></img>
                </Link>
                <div className={styles['user-chat']}>
                    <Link to={`/${props.to.user_id}`}>
                        <h4>{toProps.name}</h4>
                    </Link>

                    <span className={styles['last-message']}>{conversationProps.last_message}</span>
                </div>
            </div>
            <div className={styles['last-active']}>
                <span className={styles['time']}>{timeago.format(conversationProps.last_active)}</span>
            </div>
        </div >
    )
}

export default BoxChat;