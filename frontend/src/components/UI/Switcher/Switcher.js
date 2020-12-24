import React, { Component } from 'react';
import { connect } from 'react-redux';
import { onUserRoleSwitch } from '../../../containers/store/actions';
import * as styles from './Switcher.module.css';

class Switcher extends Component {

    render() {
        return (
            <div className={[styles['switcher'], styles[this.props.customStyle]].join(' ')}>
                <label><h4>{this.props.userRole}</h4></label>
                <input type="checkbox" id="switch"
                    onChange={() => { this.props.changeRole && this.props.onUserRoleSwitch(this.props.userRole) }}
                    onClick={this.props.clicked} />
                <label className={styles['switch-label']} htmlFor="switch">Toggle</label>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userRole: state.authReducer.userRole
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onUserRoleSwitch: (userRole) => dispatch(onUserRoleSwitch(userRole))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);
