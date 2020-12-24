import React, { Component, Fragment } from 'react';
import Category from '../../components/Category/Category';
import Navbar from '../../components/Navbar/Navbar';
import axios from '../../axios-baseURL';
import io from 'socket.io-client';
import * as styles from './Homepage.module.css';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import { Route } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import Intro from '../../components/Intro/Intro';

let socket;

class Homepage extends Component {
    state = {
        recentlyViews: [],
        bestServices: [],
        onDemandServices: [],
        userNotifications: []
    }

    componentDidMount = async () => {
        try {
            const userId = this.props.userId;
            const recentlyViewsData = await axios.get(`/${userId}/recently-view`);
            const bestServicesData = await axios.get(`/searches?keyword=Tester&rating=desc&page=0&user-role=Seller&user-id=${userId}`);
            const onDemandServices = await axios.get(`/searches?keyword=Tester&rating=desc&page=0&user-role=Buyer&user-id=${userId}`);

            const userNotifications = await axios.get(`/${userId}/notifications`);

            socket = io(this.state.ENDPOINT);
            socket.on('user-connected', userId)

            this.setState({
                recentlyViews: recentlyViewsData.data.message === 'success' ? this.state.recentlyViews.concat(recentlyViewsData.data.results) : [],
                bestServices: bestServicesData.data.message === 'success' ? this.state.bestServices.concat(bestServicesData.data.results) : [],
                onDemandServices: onDemandServices.data.message === 'success' ? this.state.onDemandServices.concat(onDemandServices.data.results) : [],
                userNotifications: userNotifications.data
            })
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
            saved={false}></ServiceCard>
    }

    onShowingServiceDetails = async service_id => {
        this.props.history.push(this.props.match.url + `services/${service_id}`);
        this.props.onServiceDetailsHandle();
        try {
            const userId = this.props.userId;
            const responseData = await axios.post(`/${userId}/recently-view/new`, { serviceId: service_id });
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        return (
            <Fragment>
                <section className={styles['navbar']}>
                    <Navbar
                        onUserRoleSwitch={this.props.onUserRoleSwitch}
                        notifications={this.state.userNotifications}></Navbar>
                </section>
                <section className={styles['main-content']}>
                    <Intro header='Find the best opportunities for you :D'></Intro>
                    {this.state.recentlyViews.length !== 0 && (
                        <Category
                            customStyle=''
                            header='true'
                            title='Recently view'
                            numOfSlides='3'
                            numOfScroll='1'>
                            {this.state.recentlyViews.map((service, id) => {
                                return this.serviceCard(service, id)
                            })}
                        </Category>
                    )}
                    {this.state.bestServices.length !== 0 && (
                        <Category
                            customStyle=''
                            header='true'
                            title='Best services in Web development'
                            numOfSlides='3'
                            numOfScroll='1'>
                            {this.state.bestServices.map((service, id) => {
                                return this.serviceCard(service, id)
                            })}
                        </Category>
                    )}
                    {this.state.onDemandServices.length !== 0 && (
                        <Category
                            customStyle=''
                            header='true'
                            withSeeAll='true'
                            to='/'
                            title='On demanding services in Web development'
                            numOfSlides='3'
                            numOfScroll='1'>
                            {
                                this.state.bestServices.map((service, id) => {
                                    return this.serviceCard(service, id)
                                })
                            }
                        </Category>
                    )}
                </section>
                <section className={styles['service-details']}>
                    <Route path={this.props.match.url + '/details/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                </section>
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
        searchKeywords: state.searchKeywords
    }
}

const mapDispatchToProps = dispatch => {
    return {
        pageIsLoading: () => dispatch(actions.loading()),
        pageLoaded: () => dispatch(actions.loaded()),
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Homepage);
