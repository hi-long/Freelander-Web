import React from 'react';
import * as styles from './RangeSlider.module.css';

const RangeSlider = props => {
    return (
        <div className={styles['slider-container']}>
            <label>{props.value}$</label>
            <input
                className={[styles['slider'], styles[props.customStyle]].join(' ')}
                type="range"
                min={props.min}
                max={props.max}
                value={props.value}
                onChange={props.changed}
                required={true} />
        </div >
    )
}

export default RangeSlider;

