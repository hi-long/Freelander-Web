import React from 'react';
import { connect } from 'react-redux';
import Navbar from '../../components/Navbar/Navbar';
import * as styles from './ServiceManagement.module.css';
import * as actions from '../store/actions/index';
import axios from '../../axios-baseURL';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import { Route } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading/Loading';

class ServiceManagement extends PureComponent {
    state = {
        services: [],
        jobs: [],
        isLoading: true,
        userNotifications: []
    }

    componentDidMount = async () => {
        try {
            const allData = await axios.get(`/${this.props.userId}/services`);
            const userId = this.props.userId;
            const userNotifications = await axios.get(`/${userId}/notifications`);

            this.setState({
                services: this.state.services.concat(allData.data.servicesData),
                jobs: this.state.jobs.concat(allData.data.jobsData),
                isLoading: false,
                userNotifications: userNotifications.data
            })
        } catch (err) {
            console.log(err);
        }
    }

    onShowingServiceDetails = (service_id) => {
        this.props.history.push(this.props.match.url + `/${service_id}`);
        this.props.onServiceDetailsHandle();
    }

    onHidingServiceDetails = () => {
        this.props.onServiceDetailsHandle();
        this.props.history.goBack();
    }

    serviceCard = (service, id, type) => {
        return <ServiceCard
            key={id}
            customGalleryStyle='profile-business'
            imagesToShow={1}
            clicked={() => this.onShowingServiceDetails(service.service_id)}
            images={service.images}
            cover={service.owner.cover}
            name={service.owner.name}
            description={service.title}
            no_reviews={service.no_reviews}
            rating={service.rating}
            type={type}
            min_price={service.min_price}></ServiceCard>
    }

    render() {
        const services = this.state.services;
        const jobs = this.state.jobs;

        return (
            <main>
                <div className={styles[this.props.onServiceDetails ? 'blur' : '']}>
                    <section className={styles['navbar']}>
                        <Navbar
                            active='Your business'
                            onUserRoleSwitch={this.props.onUserRoleSwitch}
                            notifications={this.state.userNotifications}
                        ></Navbar>
                    </section>
                    {!this.state.isLoading ?
                        <section className={styles['main']}>
                            <section className={styles['services-wrapper']}>
                                <header>
                                    <h2>All your services</h2>
                                </header>
                                {services.length !== 0 ? (
                                    <div className={styles['services']}>
                                        {services.map((service, id) => {
                                            return this.serviceCard(service, id, 'Seller')
                                        })}
                                    </div>
                                )
                                    : (
                                        <div className={[styles['no-results'], styles['no-services']].join(' ')}>
                                            <h2>There is no services</h2>
                                            <br></br>
                                            <Link to={`/${this.props.userId}/service-builder`}>
                                                <h2>Create a new one 😊 </h2>
                                            </Link>
                                        </div>
                                    )}
                            </section>
                            <section className={styles['jobs-wrapper']}>
                                <header>
                                    <h2>All your jobs</h2>
                                </header>
                                {jobs.length !== 0 ? (
                                    <div className={styles['jobs']}>
                                        {jobs.map((service, id) => {
                                            return this.serviceCard(service, id, 'Buyer');
                                        })}
                                    </div>
                                ) : (
                                        <div className={[styles['no-results'], styles['no-jobs']].join(' ')}>
                                            <h2>There is no jobs</h2>
                                            <br></br>
                                            <Link to={`/${this.props.userId}/service-builder`}>
                                                <h2>Create a new one 😊</h2>
                                            </Link>
                                        </div>
                                    )}
                            </section>
                        </section>
                        : (
                            <Loading></Loading>
                        )}
                </div>
                <section className={styles['service-details']}>
                    <Route path={this.props.match.url + '/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                </section>
            </main>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        username: state.authReducer.name,
        userRole: state.authReducer.userRole,
        onServiceDetails: state.otherReducer.onServiceDetails
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

export default connect(mapStateToProps, mapDispatchToProps)(ServiceManagement);

