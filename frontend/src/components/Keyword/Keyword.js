import React from 'react';
import * as styles from './Keyword.module.css';

import { Link } from 'react-router-dom';

const Keyword = props => {
    const edit = props.editable && (
        <img
            className={styles['keyword__delete']}
            alt=''
            src={process.env.PUBLIC_URL + '/images/ServiceDetails/keyword_delete.png'}
            onClick={props.delete}
        ></img>
    );
    const keyword = props.directable ? (
        <Link to={`/browse?&keyword=${props.children}&page=0&user-role=${props.userRole}&user-id=${props.userId}`}>
            <span className={styles['keyword__name']}>{props.children}</span>
        </Link>
    ) : (
            <span className={styles['keyword__name']}>{props.children}</span>
        )
    return (
        <div
            onClick={props.clicked}
            className={[styles['keyword'], styles[props.customStyle], styles[props.selected && 'keyword--selected']].join((' '))}>
            <div className={styles['wrapper']}>
                {edit}
                {keyword}
            </div>
        </div>
    )
}

export default Keyword;
