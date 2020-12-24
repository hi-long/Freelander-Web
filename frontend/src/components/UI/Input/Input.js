import React, { Fragment } from 'react';
import * as styles from './Input.module.css';

const Input = props => {

    let inputElement = null;

    switch (props.elementType) {
        case ('input'):
            inputElement = <input
                className={styles[props.customStyle]}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed}
                onKeyPress={props.pressed}
                onClick={props.clicked}></input>
            break;
        case ('textarea'):
            inputElement = <textarea
                className={styles[props.customStyle]}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed}
                onKeyPress={props.pressed}
                onClick={props.clicked}></textarea>
            break;
        case ('select'):
            inputElement = <select
                className={styles[props.customStyle]}
                value={props.value}
                onChange={props.changed}
                onKeyPress={props.pressed}
                onClick={props.clicked}>
                {props.elementConfig.options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.displayValue}
                    </option>
                ))}
            </select>
            break;
        case ('file'):
            inputElement = <input
                type='file'
                className={styles[props.customStyle]}
                {...props.elementConfig}
                onChange={(event) => props.changed(event)}
                onKeyPress={props.pressed}></input>
            break;
        case ('submit'):
            inputElement = <input
                type='submit'
                className={styles[props.customStyle]}
                {...props.elementConfig}
                onKeyPress={props.pressed}
                onSubmit={props.submit}
            ></input>
            break;
        default:
            inputElement = <input
                className={styles[props.customStyle]}
                {...props.elementConfig}
                value={props.value}
                onChange={props.changed}
                onKeyPress={props.pressed}></input>;
    }
    return (
        <Fragment>
            { inputElement}
        </Fragment>
    )
}

export default Input;
