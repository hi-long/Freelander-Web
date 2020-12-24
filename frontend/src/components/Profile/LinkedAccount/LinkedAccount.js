import React from 'react';
import * as styles from './LinkedAccount.module.css';

const LinkedAccount = props => {
    return (
        <div
            className={[styles[props.onEdit ? 'linked-account--on-edit' : ''], styles['linked-account'], styles[props.attachedLink === '' ? 'icon-hide' : '']].join(' ')}
            onClick={props.clicked}>
            <label>
                <a href={props.attachedLink}>
                    <img alt='' src={process.env.PUBLIC_URL + `/images/profile/${props.thirdPartyIcon}.png`}></img>
                </a>
            </label>
        </div>
    )
}

export default LinkedAccount;
