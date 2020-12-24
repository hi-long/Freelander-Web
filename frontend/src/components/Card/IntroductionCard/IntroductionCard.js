import React from 'react';
import * as styles from './IntroductionCard.module.css';

const IntroductionCard = props => {
    return (
        <div className={[styles['card'], styles[props.customStyle]].join(' ')}>
            <div className={styles[`card__image`]}>
                <img alt='...' src={props.image}></img>
            </div>
            <div className={styles[`card__service-name`]}>
                <span className={styles[`card__service-name__description`]}>{props.description}</span>
                <span className={styles[`card__service-name__name`]}>{props.name}</span>
            </div>
        </div>
    )
}

export default IntroductionCard;
