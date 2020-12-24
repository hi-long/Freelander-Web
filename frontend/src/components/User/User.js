import React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './User.module.css';

const User = props => {
    return (
        <header className={styles['user']}>
            <Link to={`/${props.userId}`}>
                <img alt='' src={props.cover}></img>
                <h4>{props.name}</h4>
                <span><img alt='' src={process.env.PUBLIC_URL + '/images/Profile/star.png'}></img> {props.rating}</span>
            </Link>
        </header>
    )
}

export default User;

