import React from 'react';
import { Component } from 'react';
import * as styles from './Select.module.css';

class Select extends Component {
    state = {
        optionsShowing: false
    }

    onOptionListToggle = () => {
        this.setState({
            optionsShowing: !this.state.optionsShowing
        })
    }

    render() {
        const optionsShowing = this.state.optionsShowing;
        const choice = this.props.choice;
        return (
            <div className={[styles['select'], styles[this.props.customStyle]].join(' ')}>
                <header onClick={this.onOptionListToggle}>
                    <h4>{choice}</h4>
                    <img
                        className={styles['select-arrow']}
                        alt=''
                        src={process.env.PUBLIC_URL + `/images/Select/${optionsShowing ? 'down' : 'up'}.png`}></img>
                </header>
                {optionsShowing && <div className={styles['option-list']}>
                    {this.props.options.map(option => (
                        <div className={styles['option']} key={option}
                            onClick={(event) => { this.props.onChoosing(event, option); this.onOptionListToggle() }}>{option}</div>
                    ))}
                </div>}
            </div>
        )
    }
}

export default Select;
