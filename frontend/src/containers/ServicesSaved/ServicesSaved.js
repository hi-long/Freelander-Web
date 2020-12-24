import React, { Component, Fragment } from 'react';
import * as styles from './ServicesSaved.module.css';
import Navbar from '../../components/Navbar/Navbar';
import Category from '../../components/Category/Category';
import { Route } from 'react-router';
import axios from '../../axios-baseURL';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import Notification from '../../components/Notification/Notification';
import Loading from '../../components/Loading/Loading';

class ServicesSaved extends Component {
    state = {
        services: [],
        suggestions: [],
        notification: {
            state: false,
            message: ''
        },
        isLoading: true,
        userNotifications: []
    }

    componentDidMount = async () => {
        try {
            const userId = this.props.userId;
            const servicesData = await axios.get(`/${userId}/saved-list`)
            const suggestions = await axios.get(`/searches?keyword=Tester&rating=desc&page=0&user-role=${this.props.userRole}&user-id=${userId}`)
            const userNotifications = await axios.get(`/${userId}/notifications`);

            this.setState({
                services: this.state.services.concat(servicesData.data),
                suggestions: this.state.suggestions.concat(suggestions.data.results),
                isLoading: false,
                userNotifications: userNotifications.data
            })
        } catch (err) {
            console.log(err);
        }
    }

    onShowingServiceDetails = (service_id) => {
        this.props.history.push(this.props.match.url + `/services/${service_id}`);
        this.props.onServiceDetailsHandle();
    }

    onHidingServiceDetails = () => {
        this.props.onServiceDetailsHandle();
        this.props.history.goBack();
    }

    onDeleteFromSavedList = async serviceId => {
        try {
            const userId = this.props.userId;
            const responseData = await axios.delete(`/${userId}/saved-list/${serviceId}`);
            this.setState({
                services: this.state.services.filter(result => result
                    .service_id !== serviceId),
                notification: {
                    state: true,
                    message: responseData.data.message
                }
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err);
        }
    }

    onNotificationToggle = () => {
        setTimeout(() => {
            this.setState({
                notification: {
                    state: !this.state.notification.state,
                    message: ''
                }
            })
        }, 2000)
    }


    onAddToSaveList = async serviceId => {
        try {
            const userId = this.props.userId;
            const addToSavedList = await axios.post(`/${userId}/saved-list/new`, { serviceId });
            const addedService = this.state.suggestions.find(service => service.service_id === serviceId);
            this.setState({
                services: this.state.services.concat(addedService),
                suggestions: this.state.suggestions.filter(service => service.service_id !== serviceId),
                notification: {
                    state: true,
                    message: addToSavedList.data.message
                }
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err);
        }
    }

    serviceCard = (service, id, savedListFunc, isSave) => {
        return <ServiceCard
            key={id}
            customGalleryStyle='profile-business'
            imagesToShow={1}
            clicked={() => this.onShowingServiceDetails(service.service_id)}
            savedList={savedListFunc}
            images={service.images}
            cover={service.owner.cover}
            name={service.owner.name}
            description={service.title}
            no_reviews={service.no_reviews}
            rating={service.rating}
            min_price={service.min_price}
            type={service.type}
            savable={true}
            saved={isSave}></ServiceCard>
    }

    render() {
        const savedServices = this.state.services.length === 0 ? undefined : this.state.services;
        const isLoading = this.state.isLoading;

        return (
            <Fragment>
                <section className={[styles['navbar'], styles[this.props.onServiceDetails ? 'blur' : '']].join(' ')}>
                    <Navbar
                        active='Saved List'
                        onUserRoleSwitch={this.props.onUserRoleSwitch}
                        notifications={this.state.userNotifications}></Navbar>
                </section>
                {!isLoading ?
                    <section className={[styles['content'], styles[this.props.onServiceDetails ? 'blur' : '']].join(' ')}>
                        {savedServices ?
                            <div className={styles['services-wrapper']}>

                                <header>
                                    <h2>Your saved services 🙂</h2>
                                </header>
                                <div className={styles['services']}>
                                    {this.state.services.map((service, id) => {
                                        return this.serviceCard(service, id, () => this.onDeleteFromSavedList(service.service_id), true)
                                    })}
                                </div>
                            </div>
                            : (
                                <div className={styles['no-services']}>
                                    <h2>There is no services 😐</h2>
                                </div>
                            )}
                        <Category
                            customStyle='saved-services'
                            header='true'
                            to='/'
                            title='Maybe you will need 😄'
                            numOfSlides={this.state.suggestions.length > 3 ? 3 : this.state.suggestions.length}
                            numOfScroll='1'>
                            {this.state.suggestions.map((service, id) => {
                                return this.serviceCard(service, id, () => this.onAddToSaveList(service.service_id), false)
                            })}
                        </Category>
                    </section> : (
                        <Loading></Loading>
                    )}
                <section className={styles['service-details']}>
                    <Route path={this.props.match.url + '/services/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                </section>
                {this.state.notification.state && <section className={styles['notification']}>
                    <Notification type='done'>{this.state.notification.message}</Notification>
                </section>}
            </Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        username: state.authReducer.name,
        userRole: state.authReducer.userRole,
        searchKeywords: state.searchKeywords,
        authCompShowing: state.authReducer.authCompToggle,
        onServiceDetails: state.otherReducer.onServiceDetails
    }
}

const mapDispatchToProps = dispatch => {
    return {
        pageIsLoading: () => dispatch(actions.loading()),
        pageLoaded: () => dispatch(actions.loaded()),
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth)),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServicesSaved);

