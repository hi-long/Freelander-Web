import React, { Component, Fragment } from 'react';
import Category from '../../components/Category/Category';
import Navbar from '../../components/Navbar/Navbar';
import axios from '../../axios-baseURL';
import * as styles from './NotFound.module.css';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import { Route, withRouter } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import Notification from '../../components/Notification/Notification';
import Loading from '../../components/Loading/Loading';
import queryString from 'query-string';

class NotFound extends Component {
    state = {
        keyword: '',
        relatedServices: [],
        notification: {
            state: false,
            message: ''
        },
        keyword: '',
        userNotifications: [],
        isLoading: true
    }

    componentDidMount = async () => {
        try {
            const keyword = queryString.parse(this.props.location.search);
            const userId = this.props.userId;
            const userRole = this.props.userRole;
            const relatedServicesData = await axios(`/searches?keyword=Enzyme&&rating=desc&page=0&user-role=${userRole}&user-id=${userId}`)
            const userNotifications = await axios.get(`/${userId}/notifications`);
            this.setState({
                isLoading: false,
                relatedServices: relatedServicesData.data.message === 'success' ? this.state.relatedServices.concat(relatedServicesData.data.results) : [],
                userNotifications: userNotifications.data,
                keyword: keyword['keyword']
            })
        } catch (err) {
            console.log(err);
        }
    }

    onAddToSaveList = async serviceId => {
        try {
            const userId = this.props.userId;
            const addToSavedList = await axios.post(`/${userId}/saved-list/new`, { serviceId });
            this.onNotificationToggle();
            this.setState({
                relatedServices: this.state.relatedServices.filter(service => service.service_id !== serviceId),
                notification: {
                    state: true,
                    message: addToSavedList.data.message
                }
            })
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

    onAuthButtonClicked = () => {
        this.props.authCompToggle(!this.props.authCompShowing);
    }

    onShowingServiceDetails = async service_id => {
        const userId = this.props.userId;
        this.props.history.push(this.props.match.url + `/services/${service_id}`);
        this.props.onServiceDetailsHandle();
        try {
            const responseData = await axios.post(`/${userId}/recently-view/new`, { serviceId: service_id });
        } catch (err) {
            console.log(err);
        }
    }

    onHidingServiceDetails = () => {
        this.props.onServiceDetailsHandle();
        this.props.history.goBack();
    }

    onUserRoleSwitch = async () => {
        try {
            const userId = this.props.userId;
            const userRole = this.props.userRole === 'Seller' ? 'Buyer' : 'Seller';
            const newSearchingURL = `?keyword=${this.state.keyword}&page=${0}&user-role=${userRole}&user-id=${userId}`;
            this.props.history.push(`/browse${newSearchingURL}`);
            const responseResults = await axios.get(`/searches${newSearchingURL}`);
            this.setState({
                page: {
                    ...this.state.page,
                    current: 0
                },
                searchResults: [].concat(responseResults.data.results),
            })
            this.props.onUserRoleSwitch();
        } catch (err) {
            console.log(err);
        }
    }

    serviceCard = (service, id) => {
        return <ServiceCard
            key={id}
            customGalleryStyle='profile-business'
            imagesToShow={1}
            clicked={() => this.onShowingServiceDetails(service.service_id)}
            savedList={service.saved ? (() => this.onDeleteFromSavedList(service.service_id)) : (() => this.onAddToSaveList(service.service_id))}
            owner={service.owner.user_id}
            images={service.images}
            cover={service.owner.cover}
            name={service.owner.name}
            description={service.title}
            no_reviews={service.no_reviews}
            rating={service.rating}
            min_price={service.min_price}
            type={service.type}
            savable={true}
            saved={false}></ServiceCard>
    }

    render() {
        const relatedServices = this.state.relatedServices;
        const isLoading = this.state.isLoading;
        const userRole = this.props.userRole;
        return (
            <main>
                {isLoading && <Loading></Loading>}
                < div className={[styles['not-found'], styles[this.props.authCompShowing || isLoading ? 'blur' : '']].join(' ')} >
                    <section className={styles['navbar']}>
                        <Navbar
                            onUserRoleSwitch={this.onUserRoleSwitch}
                            onAuthInit={this.onAuthButtonClicked}
                            notifications={this.state.userNotifications}></Navbar>
                    </section>
                    <section className={styles['search-for']}>
                        <h2><b>{userRole === 'Seller' ? 'Jobs' : 'Services'}</b> belong to: <span>{this.state.keyword}</span></h2>
                    </section>
                    <section className={styles['message']}>
                        <h1>NOT FOUND  &nbsp;</h1>
                        <img alt='' src={process.env.PUBLIC_URL + '/images/NotFound/sad.png'}></img>
                    </section>
                    <section className={styles['related-services']}>
                        {(relatedServices.length !== 0 && !this.state.isLoading) &&
                            (<Fragment>
                                <Category
                                    customStyle=''
                                    header='true'
                                    title={`Related ${userRole === 'Seller' ? 'Jobs' : 'Services'}`}
                                    numOfSlides={relatedServices.length < 3 ? relatedServices.length : 3}
                                    numOfScroll='1'>
                                    {this.state.relatedServices.map((service, id) => {
                                        return this.serviceCard(service, id)
                                    })}
                                </Category>
                                <Category
                                    customStyle=''
                                    header='true'
                                    title='You may also like'
                                    numOfSlides={relatedServices.length < 3 ? relatedServices.length : 3}
                                    numOfScroll='1'>
                                    {this.state.relatedServices.map((service, id) => {
                                        return this.serviceCard(service, id)
                                    })}
                                </Category>
                                {this.state.notification.state && <section className={styles['notification']}>
                                    <Notification type='done'>The service is successfully saved 😄</Notification>
                                </section>}
                            </Fragment>)
                        }
                    </section>
                    <section className={styles['service-details']}>
                        <Route path={this.props.match.url + '/services/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                    </section>
                </div >
            </main>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userRole: state.authReducer.userRole,
        authCompShowing: state.authReducer.authCompToggle,
        searchKeywords: state.otherReducer.searchKeywords
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSearching: (searchKeywords) => dispatch(actions.onSearching(searchKeywords)),
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth)),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(NotFound));