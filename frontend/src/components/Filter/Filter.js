import React from 'react';
import Input from '../UI/Input/Input';
import * as styles from './Filter.module.css';

const Filter = props => {
    const advancedFilter = props.sortBy === 'ascending' && (
        <div className={styles['advanced-filter']}>
            <Input
                type='input'
                customStyle='filter-price'
                value={props.filterMinPrice}
                changed={props.onFilterMinPriceInput}
                elementConfig={{
                    type: 'number',
                    placeholder: 'Minimum'
                }}
            ></Input>
            <Input
                type='input'
                customStyle='filter-price'
                value={props.filterMaxPrice}
                changed={props.onFilterMaxPriceInput}
                elementConfig={{
                    type: 'number',
                    placeholder: 'Maximum'
                }}
            ></Input>
        </div>
    )
    return (
        < div className={[styles['container'], styles[props.customStyle]].join(' ')} >
            <div className={styles['filter']} onClick={props.onFiltering}>
                <span className={styles['filter__name']}>{props.name}</span>
                <span className={props.sortBy === 'ascending' ? styles['filter__arrow-up'] : styles['filter__arrow-down']}>
                    <img
                        alt='...'
                        src={process.env.PUBLIC_URL + '/images/ServicesBrowse/sortByDescending.png'} ></img>
                </span>
            </div>
            {props.hasAdvanced && advancedFilter}
        </div >
    )
}

export default Filter;
