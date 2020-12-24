import React, { Component } from 'react';
import User from '../User/User';
import * as styles from './Review.module.css';
import * as utilities from '../../containers/utility/utility';
import Input from '../UI/Input/Input';

class Review extends Component {
    state = {
        onEdit: false,
        newContent: ''
    }

    onEdit = () => {
        this.setState({
            onEdit: true
        })
    }

    onCancelEdit = () => {
        this.setState({
            onEdit: false
        })
    }

    render() {
        const icons = !this.state.onEdit ?
            [{ name: 'edit', func: this.onEdit }, { name: 'delete', func: () => this.props.onReviewDelete(this.props.review_id) }]
            : [{ name: 'save', func: () => { this.props.onReviewEditSave(this.props.review_id); this.onCancelEdit() } }, { name: 'cancel', func: this.onCancelEdit }]

        return (
            <div
                className={[styles['review'], styles[`${this.props.customStyle}`]].join(' ')}
                onClick={() => this.props.reviewOnFocus(this.props.review_id, this.props.content, this.props.rating)}>
                <User userId={this.props.user_id} cover={this.props.cover} name={this.props.name} rating={this.props.rating}></User>
                <div className={styles[`${this.props.customStyle}__content`]}>
                    <p>{this.props.content}</p>
                    <i>{utilities.capitalizeFirstLetter(this.props.date)}</i>
                </div>
                {this.state.onEdit && (
                    <Input
                        customStyle='review-edit'
                        elementType='textarea'
                        elementConfig={{
                            rows: 5
                        }}
                        value={this.props.editVal}
                        changed={(event) => this.props.onReviewEdit(event, this.props.review_id)}></Input>
                )}
                {this.props.editable && (
                    <div className={styles['edit-and-delete']}>
                        {icons.map(icon => (
                            <img
                                alt=''
                                src={process.env.PUBLIC_URL + `/images/Review/${icon.name}.png`}
                                onClick={icon.func}></img>
                        ))}
                    </div>
                )}
            </div>
        )
    }
}

export default Review;