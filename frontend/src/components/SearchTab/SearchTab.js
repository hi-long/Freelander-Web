import React from 'react';
import * as styles from './SearchTab.module.css';

import Input from '../UI/Input/Input';
import Button from '../UI/Button/Button';

const SearchTab = props => {
    const customStyle = props.customStyle;

    return (
        <div className={styles[`${customStyle}__search-tab`]}>
            <div className={styles[`${customStyle}__search-tab__bar`]}>
                <Input
                    customStyle={customStyle}
                    elementType='input'
                    elementConfig={{
                        type: "text",
                        placeholder: "Search for your service"
                    }}
                    value={props.value}
                    changed={props.onSearching}
                ></Input>
                <Button customStyle={customStyle} clicked={props.clicked}>Search</Button>
            </div>
            <div className={styles[`${customStyle}__search-tab__suggestions-results`]}>

            </div>
        </div>
    )
}

export default SearchTab;


