import React from 'react';
import * as styles from './ProfileDomain.moodule.css';

const ProfileDomain = props => {
    return (
        <div className={styles['profile-domain']}>
            <header className={styles['profile-domain__header']}>
                <b>{props.title}</b>
                <span>Add new skills</span>
            </header>
            <div className={styles['profile-domain__content']}>
                {props.content}
            </div>
        </div>
    )
}

export default ProfileDomain;
