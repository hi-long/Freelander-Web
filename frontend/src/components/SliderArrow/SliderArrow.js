import React from 'react';
import * as styles from './SliderArrow.module.css';

const SliderArrow = props => {
    const type = props.type;
    return (
        <div
            className={[styles['arrow'], styles[type], styles[props.customStyle]].join(' ')}
            onClick={() => { props.onClick() }}>
            <img alt='' src={process.env.PUBLIC_URL + `/images/Slider/${type}.png`}></img>
        </div >
    )
}

export default SliderArrow;