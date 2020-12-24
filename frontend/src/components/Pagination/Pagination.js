import React from 'react';
import * as styles from './Pagination.module.css';

const Pagination = props => {
    let indexes = [];
    for (let i = 1; i <= props.noPages; i++) {
        indexes.push(i);
    }

    return (
        <div className={styles['pagination']}>
            {indexes.map(index => (
                <div
                    onClick={() => props.onPageChange(index)}
                    className={[styles['page-index'], styles[props.currentIndex === index && 'active']].join(' ')}>{index}</div>
            ))}
        </div>
    )
}

export default Pagination;