import React from 'react';
import * as styles from './BasicFieldEdit.module.css';
import Input from '../../UI/Input/Input';

const BasicFieldEdit = props => {
    return (
        <div className={styles['basic-field-edit']}>
            <h4>{props.header}</h4>
            <Input
                customStyle='basic-field'
                elementType='textarea'
                elementConfig={{
                    rows: 5
                }}
                value={props.value}
                changed={(event) => props.onEdit(event)}></Input>
        </div>
    )
}

export default BasicFieldEdit;

