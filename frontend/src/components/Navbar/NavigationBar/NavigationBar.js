import React, { Component, Fragment } from 'react';
import firebase from 'firebase';
import { Link, NavLink } from 'react-router-dom';
import SearchTab from '../../SearchTab/SearchTab';
import Button from '../../UI/Button/Button';
import * as styles from './NavigationBar.module.css';
import { connect } from 'react-redux';
import * as actions from '../../../containers/store/actions/index';
import SuggestionBox from '../../SuggestionBox/SuggestionBox';
import axios from '../../../axios-baseURL';
import * as timeago from 'timeago.js';

class NavigationBar extends Component {
    state = {
        settingOnShowing: false,
        notificationOnShowing: false,
        searchingKeyword: '',
        suggestions: []
    }

    onSettingToggle = () => {
        this.setState({
            settingOnShowing: !this.state.settingOnShowing
        })
    }

    onLogoutHandle = () => {
        this.props.onLogout();
        firebase.auth().signOut();
        window.location.reload();
    }

    onSearching = async (event) => {
        try {
            this.props.onSearching(true);
            const input = event.target.value;
            const responseSuggestionsData = await axios.get(`/suggestion/${input}`);
            const suggestions = [];
            for (let suggestion of responseSuggestionsData.data) {
                suggestions.push(suggestion.keyword);
            }
            this.setState({
                searchingKeyword: input,
                suggestions: suggestions.sort((a, b) => {
                    return a.length <= b.length;
                })
            })
        } catch (err) {
            console.log(err);
        }
    }

    notificationToggle = async () => {
        try {
            const userId = this.props.userId;
            const notificationSeen = await axios.put(`/${userId}/notifications`);
            this.setState({
                notificationOnShowing: !this.state.notificationOnShowing
            })
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        const userId = this.props.userId;

        const setting = this.state.settingOnShowing && (
            <div className={styles['toggle-util']}>
                <ul>
                    <li><a href={`/${userId}`}>Profile</a></li>
                    {/* <hr></hr> */}
                    <li onClick={this.onLogoutHandle}><Link to='/'>Logout</Link></li>
                </ul>
            </div>
        );

        const navItems = this.props.userId ? [
            { name: 'Service Builder', to: `/${userId}/service-builder` },
            { name: 'Messenger', to: `/${userId}/messenger` },
            { name: 'Your business', to: `/${userId}/services` },
            { name: 'Saved List', to: `/${userId}/saved-list` }
        ] : [];

        const notificationOnShowing = this.state.notificationOnShowing;

        return (
            <div className={styles['navigation-bar']} >
                <ul className={styles['navigation-bar__left']}>
                    <li>
                        <NavLink to='/'><span className={styles['navigation-bar__left__header']}>Freelander</span></NavLink></li>
                    <li>
                        <SearchTab customStyle='navbar' onSearching={(event) => this.onSearching(event)}></SearchTab>
                        {(this.props.searchBoxOnShowing && this.state.searchingKeyword !== '') &&
                            <SuggestionBox directable='true' customStyle='search-tab' keywords={this.state.suggestions}></SuggestionBox>}
                    </li>
                </ul>
                <ul className={styles['navigation-bar__right']}>
                    {navItems.map(navItem => {
                        return <li className={styles['routing-link']} key={navItem.name} support={navItem.name}><NavLink to={navItem.to}>
                            <img alt='' src={process.env.PUBLIC_URL + `/images/Navbar/${navItem.name}${this.props.active === navItem.name ? '-active' : ''}.png`}></img>
                        </NavLink></li>
                    })}
                    {this.props.userId && <li className={styles['notification-wrapper']}>
                        <img
                            alt=''
                            src={process.env.PUBLIC_URL + `/images/Navbar/Notification${notificationOnShowing === true ? '-active' : ''}.png`}
                            onClick={this.notificationToggle}></img>
                        {notificationOnShowing &&
                            <div className={styles['notification-list']}>
                                {this.props.notifications.length !== 0 ?
                                    this.props.notifications.map(notification => (
                                        <div className={[styles['notification'], styles[notification.seen === 0 ? 'unseen' : '']].join(' ')}>
                                            <h4><Link to={`/${notification.creator}`}>{notification.name} </Link><span>reviewed your </span><Link to={`/services/${notification.service_id}`}>{notification.type === 'Seller' ? 'service' : 'job'}</Link></h4>
                                            <span className={styles['time']}>{timeago.format(notification.created)}</span>
                                        </div>
                                    ))
                                    : (
                                        <div>
                                            <h4 style={{ textAlign: 'center', fontWeight: '300' }}>You don't have any notifications</h4>
                                        </div>
                                    )}
                            </div>
                        }
                    </li>}
                    {userId && (
                        <li
                            className={styles['switcher']}
                            support={`Switch to ${this.props.userRole === 'Seller' ? 'Buyer' : 'Seller'} for different features`}
                            onClick={() => { this.props.onUserRoleSwitch() }}>Switch to {this.props.userRole === 'Seller' ? 'Buyer' : 'Seller'}</li>
                    )}
                    <li>
                        {!this.props.userId ? <Button
                            customStyle='navbar__join-button'
                            clicked={this.props.onAuthInit}>Join</Button> :
                            (<Fragment>
                                <img
                                    onClick={this.onSettingToggle}
                                    className={styles['profile-image']}
                                    alt='' src={this.props.userCover}></img>
                                {setting}
                            </Fragment>)}
                    </li>
                </ul>
            </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        username: state.authReducer.name,
        userRole: state.authReducer.userRole,
        searchBoxOnShowing: state.otherReducer.onSearching
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout()),
        onSearching: (value) => dispatch(actions.onSearching(value))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
