import React, { Component } from 'react';
import AuthField from '../../components/Authentication/AuthField';
import Input from '../../components/UI/Input/Input';
import * as styles from './Authentication.module.css';
import { connect } from 'react-redux';
import "firebase/auth";
import * as actions from '../store/actions/index';
import { Fragment } from 'react';
import Notification from '../../components/Notification/Notification';

class Authentication extends Component {

    constructor(props) {
        super(props);

        this.authenticationDiv = React.createRef();
    }

    state = {
        route: 'LOGIN',
        email: '',
        password: '',
        retypePassword: '',
        thirdParty: ['facebook', 'google', 'github'],
        message: {
            email: '',
            password: '',
            retypePassword: ''
        },
        notification: {
            state: false,
            message: '',
            type: ''
        }
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onAuthEscape);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onAuthEscape);
    }

    onAuthEscape = (event) => {
        if (this.authenticationDiv && !this.authenticationDiv.current.contains(event.target)) {
            this.props.authCompToggle(!this.props.authCompShowing);
        }
    }

    routeChangeHandler = () => {
        this.setState({
            route: this.state.route === 'LOGIN' ? 'SIGNUP' : 'LOGIN',
            message: ''
        })
    }

    toForgotPassword = () => {
        this.setState({
            route: 'FORGOT',
            message: ''
        })
    }

    fieldInputHandler = (event, field) => {
        this.setState({
            [field]: event.target.value
        })
    }

    onThirdPartyAuth = async provider => {
        try {
            this.props.thirdPartyAuth(provider);
        } catch (err) {
            console.log(err);
        }
    }

    formSubmitHandler = async (event, route) => {
        try {
            event.preventDefault();
            const email = this.state.email, password = this.state.password;
            if (this.state.route === 'SIGNUP' && this.state.retypePassword !== password) {
                this.setState({
                    message: {
                        ...this.state.message,
                        retypePassword: 'Not match'
                    }
                })
            } else {
                this.props.onAuth(email, password, route)
            }
        } catch (err) {
            console.log(err);
        }
    }

    clearMessage = () => {
        this.setState({
            message: {
                ...this.state.message,
                email: ''
            }
        })
    }

    render() {
        const route = this.state.route;
        return (
            <div ref={this.authenticationDiv} className={styles['auth']} onBlur={this.props.onAuthEscape}>
                <div className={styles['behind']}></div>
                <div className={[styles['front'], styles[this.state.route === 'SIGNUP' && 'front--signup']].join(' ')}>
                    <h1>{this.state.route}</h1>
                    <img
                        className={styles['switcher']}
                        alt=''
                        src={process.env.PUBLIC_URL + `/images/Authentication/switcher${this.state.route === 'SIGNUP' ? '-signup' : ''}.png`}
                        onClick={this.routeChangeHandler}></img>
                    <div className={styles['third-party']}>
                        {this.state.thirdParty.map(provider => (
                            <div className={styles['party']}>
                                {/* <a href={`/auth/${party}`}> */}
                                <img
                                    alt=''
                                    src={process.env.PUBLIC_URL + `/images/Authentication/${provider}.png`}
                                    onClick={() => this.onThirdPartyAuth(provider)}
                                ></img>
                                {/* </a> */}
                                {/* </Link> */}
                            </div>
                        ))}
                    </div>
                    <form className={styles['input-form']}
                        onSubmit={(event) => this.formSubmitHandler(event, this.state.route)}>
                        {(route === 'LOGIN' || route === 'SIGNUP') &&
                            <Fragment>
                                <AuthField
                                    field='email'
                                    type='email'
                                    value={this.state.email}
                                    inputVal={this.fieldInputHandler}
                                    message={this.state.message.email}
                                    clicked={this.clearMessage}>Email</AuthField>
                                <AuthField
                                    field='password'
                                    type='password'
                                    value={this.state.password}
                                    inputVal={this.fieldInputHandler}
                                    minLength={6}
                                    message={this.state.message.password}
                                    clicked={this.clearMessage}>Password</AuthField>
                            </Fragment>
                        }
                        {route === 'SIGNUP' && <AuthField
                            field='retypePassword'
                            type='password'
                            value={this.state.retypePassword}
                            inputVal={this.fieldInputHandler}
                            minLength={6}
                            message={this.state.message.retypePassword}>Retype Password</AuthField>}
                        <div className={'submit'}>
                            <Input
                                customStyle='auth-submit'
                                elementType='submit'></Input>
                        </div>
                    </form>
                    {this.props.authError && <section className={styles['notification']}>
                        <Notification type='fail'>There is something wrong with your email or password</Notification>
                    </section>}
                </div>
            </div >
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        authError: state.authReducer.error,
        authCompShowing: state.authReducer.authCompToggle,
    }
}

const mapDispatchToProps = dispatch => {
    return {
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth)),
        onAuth: (email, password, mode) => dispatch(actions.auth(email, password, mode)),
        thirdPartyAuth: (provider) => dispatch(actions.thirdPartyAuth(provider))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Authentication);