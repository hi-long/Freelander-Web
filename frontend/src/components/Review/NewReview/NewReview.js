import React from 'react';
import * as styles from './NewReview.module.css';

import Input from '../../UI/Input/Input';

const NewReview = props => {
    return (
        <div className={[styles['new-review'], styles[props.customStyle]].join(' ')}>
            <form onSubmit={(event) => props.onUpload(event)}>
                <header>
                    <div className={styles['user-info']}>
                        <img alt='' src={props.userCover}></img>
                        <h5>{props.username}</h5>
                        <span>
                            <img alt='' src={process.env.PUBLIC_URL + '/images/Profile/star.png'}></img>
                            <Input customStyle='new-review__rating'
                                elementType='input'
                                elementConfig={{
                                    type: 'number',
                                    placeholder: 'Rate this service',
                                    max: '5',
                                    value: props.ratingVal,
                                    required: true
                                }}
                                changed={props.onRatingInput}></Input></span>
                    </div>
                    <div className={styles['upload']}>
                        <Input
                            customStyle='review-submit'
                            elementType='submit'></Input>
                    </div>
                </header>
                <div className={styles[`new-review__content`]}>
                    <Input customStyle='new-review__content'
                        elementType='textarea'
                        elementConfig={{
                            type: 'text',
                            placeholder: 'Share your opinion',
                            rows: 5,
                            required: true
                        }}
                        value={props.contentVal}
                        changed={props.onContentInput}></Input>
                </div>
            </form>
        </div >
    )
}

export default NewReview;