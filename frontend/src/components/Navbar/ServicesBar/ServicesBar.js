import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as styles from './ServicesBar.module.css';

const services = ['Web programming', 'Mobile apps', 'Game development',
    'Data', 'Testing', 'Design', 'IT manager', 'Network', 'Security', 'Others'
];

class ServicesBar extends Component {
    render() {
        return (
            <div className={styles['services-bar']} >
                <div className={styles['services-bar__content']}>
                    {services.map(service => {
                        return <span
                            key={service}><Link to={`/browse?keyword=${service}&page=0&user-role=${this.props.userRole}&user-id=${this.props.userId}`} > {service}</Link></span>
                    })}
                </div>
            </div >
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userRole: state.authReducer.userRole,
    }
}

export default connect(mapStateToProps)(ServicesBar);
