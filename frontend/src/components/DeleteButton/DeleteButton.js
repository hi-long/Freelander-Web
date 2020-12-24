import React, { Component } from 'react';
import * as styles from './DeleteButton.module.css';

class DeleteButton extends Component {
    state = {
        active: false
    }

    onActiveHandler = () => {
        this.setState({
            active: !this.state.active
        })
    }

    render() {
        return (
            <div className={[styles['delete-button'], styles[this.props.customStyle], styles[this.state.active && 'delete-button--active']].join(' ')}>
                <span className={[styles['trigger'], styles[this.state.active && 'trigger--active']].join(' ')} onClick={this.onActiveHandler}>
                    <img alt='' src={process.env.PUBLIC_URL + '/images/GalleryItem/delete.png'}></img>
                </span>
                <span
                    className={[styles['confirm'], styles[this.state.active && 'confirm--active']].join(' ')}
                    onClick={() => this.props.clicked(this.props.imageUrl)}>
                    <img alt='' src={process.env.PUBLIC_URL + '/images/GalleryItem/confirm.png'}></img>
                </span>
            </div>
        )
    }
}

export default DeleteButton;