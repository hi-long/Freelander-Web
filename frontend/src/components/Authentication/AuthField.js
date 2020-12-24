import React from 'react';
import Input from '../UI/Input/Input';
import * as styles from './AuthField.module.css';

const AuthField = props => {
    return (
        <div className={[styles['auth-field'], styles[props.customStyle]].join(' ')}>
            <Input
                customStyle='auth-input'
                elementType='input'
                elementConfig={{
                    type: props.type,
                    required: true,
                    id: props.field,
                    minLength: props.minLength
                }}
                value={props.value}
                changed={(event) => props.inputVal(event, props.field)}
                clicked={props.clicked}></Input>
            <label className={[styles['label'], styles[props.value !== '' ? 'up' : '']].join(' ')} htmlFor={props.field}>{props.children}</label>
            <label className={styles['icon']}>
                <img alt='' src={process.env.PUBLIC_URL + `/images/Authentication/${props.field}`}></img>
            </label>
            {props.message && <label className={styles['message']}>{props.message} <img alt='' src={process.env.PUBLIC_URL + '/images/Authentication/sad.png'}></img></label>}
        </div>
    )
}

export default AuthField;