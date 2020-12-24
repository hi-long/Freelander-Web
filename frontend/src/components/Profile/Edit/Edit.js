import React from 'react';
import Button from '../../UI/Button/Button';
import * as styles from './Edit.module.css';

const Edit = props => {
    return (
        <div>
            {props.children}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Button customStyle='profile__overview' clicked={props.cancel}> Cancel</Button>
                <Button customStyle='profile__overview' clicked={props.confirm}>Confirm</Button>
            </div>
        </div>
    )
}

export default Edit;