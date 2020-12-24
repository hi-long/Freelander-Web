import React, { Fragment, PureComponent } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import * as styles from './ServicesBrowse.module.css';
import Filter from '../../components/Filter/Filter';
import { Route } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import * as actions from '../store/actions/index';
import { connect } from 'react-redux';
import axios from '../../axios-baseURL';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import Button from '../../components/UI/Button/Button';
import NotFound from '../NotFound/NotFound';
import Pagination from '../../components/Pagination/Pagination';
import * as utilities from '../utility/utility';
import queryString from 'query-string';
import Authentication from '../Authentication/Authentication';
import Notification from '../../components/Notification/Notification';
import Loading from '../../components/Loading/Loading';
import Intro from '../../components/Intro/Intro';

class ServicesBrowse extends PureComponent {

    state = {
        isLoading: true,
        keyword: '',
        searchResults: [],
        page: {
            current: 1,
            noPages: 1
        },
        filter: {
            onFilter: false,
            budget: {
                isOpen: false,
                min: 0,
                max: 1000
            },
            rating: true
        },
        notification: {
            state: false,
            message: ''
        },
        userNotifications: []
    }

    componentDidMount = async () => {
        try {
            const userId = this.props.userId;
            const keyword = utilities.getParameterByName('keyword');
            const page = utilities.getParameterByName('page');
            const responseResults = await axios.get(`/searches?keyword=${keyword}&page=${page}&user-role=${this.props.userRole}&user-id=${userId}`);
            if (this.props.userId) {
                const userNotifications = await axios.get(`/${this.props.userId}/notifications`);
                this.setState({
                    userNotifications: userNotifications.data,
                    isLoading: false
                })
            }
            if (responseResults.data.results) {
                this.setState({
                    keyword: keyword,
                    searchResults: this.state.searchResults.concat(responseResults.data.results),
                    page: {
                        ...this.state.page,
                        current: 1,
                        noPages: responseResults.data.noPages
                    },
                })
            }
            this.setState({
                isLoading: false
            })
        } catch (err) {
            console.log(err);
        }
    }

    componentDidUpdate = async (prevProps) => {
        try {
            const oldKeyword = queryString.parse(prevProps.location.search)['keyword'];
            const newKeyword = queryString.parse(this.props.location.search)['keyword'];
            if (newKeyword !== undefined) {
                if (oldKeyword !== newKeyword) {
                    // fetch the new product based and set it to the state of the component
                    const responseResults = await axios.get(`/searches?keyword=${newKeyword}&page=0&user-role=${this.props.userRole}&user-id=${this.props.userId}`);
                    if (responseResults.data.results) {
                        this.setState({
                            isLoading: false,
                            keyword: newKeyword,
                            searchResults: [].concat(responseResults.data.results),
                            page: {
                                ...this.state.page,
                                current: 1,
                                noPages: responseResults.data.noPages
                            }
                        })
                    } else {
                        this.setState({
                            searchResults: []
                        })
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    onAddToSaveList = async serviceId => {
        try {
            const userId = this.props.userId;
            const addToSavedList = await axios.post(`/${userId}/saved-list/new`, { serviceId });
            this.onNotificationToggle();
            this.setState({
                searchResults: this.state.searchResults.filter(service => service.service_id !== serviceId),
                notification: {
                    state: true,
                    message: addToSavedList.data.message
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    onDeleteFromSavedList = async serviceId => {
        try {
            const userId = this.props.userId;
            const responseData = await axios.delete(`/${userId}/saved-list/${serviceId}`);
            this.setState({
                notification: true,
                message: responseData.data.message
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err);
        }
    }

    switchFilterState = (event) => {
        event.stopPropagation();
        this.setState({
            filter: {
                ...this.state.filter,
                onFilter: !this.state.filter.onFilter
            }
        })
    }

    onFilteringByRating = () => {
        this.setState({
            filter: {
                ...this.state.filter,
                rating: !this.state.filter.rating
            }
        })
    }

    onBudgetOpen = (event) => {
        event.stopPropagation();
        this.setState({
            filter: {
                ...this.state.filter,
                budget: {
                    ...this.state.filter.budget,
                    isOpen: !this.state.filter.budget.isOpen
                }
            }
        })
    }

    onFilterMinPriceInput = event => {
        this.setState({
            filter: {
                ...this.state.filter,
                budget: {
                    ...this.state.filter.budget,
                    min: event.target.value
                }
            }
        })
    }

    onFilterMaxPriceInput = event => {
        this.setState({
            filter: {
                ...this.state.filter,
                budget: {
                    ...this.state.filter.budget,
                    max: event.target.value
                }
            }
        })
    }

    onFilter = async () => {
        try {
            const userId = this.props.userId;
            const rating = this.state.filter.rating === true ? 'desc' : 'asc';
            const responseData = await axios.get(`/searches?keyword=${this.state.keyword}&rating=${rating}&min-price=${this.state.filter.budget.min}&max-price=${this.state.filter.budget.max}&page=0&user-role=${this.props.userRole}&user-id=${userId}`)
            this.setState({
                searchResults: [].concat(responseData.data.results),
                page: {
                    current: 1,
                    noPages: responseData.data.noPages
                }
            })
        } catch (err) {
            console.log(err);
        }
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
                // loading: false
            })
            this.props.onUserRoleSwitch();
        } catch (err) {
            console.log(err);
        }
    }

    onPageChange = async next => {
        if (next !== this.state.page.current) {
            try {
                const userId = this.props.userId;
                const responseResults = await axios.get(`/searches?keyword=${this.state.keyword}&rating=${this.state.filter.rating}&min-price=${this.state.filter.budget.min}&max-price=${this.state.filter.budget.max}&page=${next - 1}&user-role=${this.props.userRole}&user-id=${userId}`);

                this.setState({
                    isLoading: false,
                    searchResults: [].concat(responseResults.data.results),
                    page: {
                        ...this.state.page,
                        current: next
                    }
                })
            } catch (err) {
                console.log(err);
            }
        }
    }

    onNavbarSelectKeyword = keyword => {
        this.setState({
            keyword: keyword,
            page: {
                ...this.state.page,
                current: 1
            }
        })
    }

    onAuthButtonClicked = () => {
        this.props.authCompToggle(!this.props.authCompShowing);
    }

    onNotificationToggle = () => {
        setTimeout(() => {
            this.setState({
                notification: {
                    status: !this.state.notification.state,
                    message: ''
                }
            })
        }, 2000)
    }

    render() {
        const auth = this.props.authCompShowing ? <Authentication></Authentication> : null;
        const userRole = this.props.userRole;

        return (
            < div >
                { auth}
                {this.state.isLoading ? <Loading></Loading> :
                    this.state.searchResults.length !== 0 ?
                        <Fragment>
                            < div className={this.props.onServiceDetails || this.props.authCompShowing || this.state.isLoading ? 'browse-hide' : styles['browse']}>
                                {/* NAVBAR */}
                                <section className={styles['navbar']}>
                                    <Navbar
                                        onUserRoleSwitch={this.onUserRoleSwitch}
                                        onNavbarSelectKeyword={this.onNavbarSelectKeyword}
                                        onAuthInit={this.onAuthButtonClicked}
                                        notifications={this.state.userNotifications}></Navbar>
                                </section>
                                {/* MAIN CONTENT */}
                                <section className={styles['main-content']}>
                                    <Intro customStyle='intro-browse' header={`Find the best ${userRole !== 'Seller' ? 'services' : 'jobs'} for you :D`}></Intro>
                                    {/* FILTER */}
                                    <section className={styles['search-for']}>
                                        <h2><b>{userRole !== 'Seller' ? 'Services' : 'Jobs'}</b> belong to: <span>{this.state.keyword}</span> </h2>
                                    </section>
                                    <section className={styles['main-content__filter']}>
                                        <div className={styles['main-content__filter__filters']}>
                                            <div className={[styles['filter-trigger'], styles[this.state.filter.onFilter && 'filter-trigger--active']].join(' ')}>
                                                <img src={process.env.PUBLIC_URL + '/images/ServicesBrowse/filter.png'}></img>
                                                <span onClick={this.switchFilterState}>Filter</span>
                                            </div>
                                            {this.state.filter.onFilter && (
                                                <Fragment>
                                                    <Filter
                                                        customStyle='browse-filter'
                                                        name='Rating'
                                                        sortBy={this.state.filter.rating ? 'ascending' : 'descending'}
                                                        onFiltering={this.onFilteringByRating}></Filter>
                                                    <Filter
                                                        customStyle='browse-filter'
                                                        name='Budget'
                                                        sortBy={this.state.filter.budget.isOpen ? 'ascending' : 'descending'}
                                                        onFiltering={(event) => this.onBudgetOpen(event)}
                                                        hasAdvanced='true'
                                                        onFilterMaxPriceInput={(event) => this.onFilterMaxPriceInput(event)}
                                                        onFilterMinPriceInput={(event) => this.onFilterMinPriceInput(event)}></Filter>
                                                    <Button customStyle='filter-apply' clicked={this.onFilter}>Apply</Button>
                                                </Fragment>
                                            )}
                                        </div>
                                    </section>
                                    {/* SERVICES */}
                                    <section className={styles['services']}>
                                        {this.state.searchResults.map((service, id) => {
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
                                                saved={false}
                                                type={service.type}
                                                savable={this.props.userId ? true : false}></ServiceCard>
                                        })}
                                    </section>
                                </section>
                            </div>
                            {/* PAGINATION */}
                            <section className={styles['pagination']}>
                                <Pagination
                                    onPageChange={this.onPageChange}
                                    noPages={this.state.page.noPages}
                                    currentIndex={this.state.page.current}></Pagination>
                            </section>
                            {/* SERVICE DETAILS */}
                            <section className={styles['service-details']}>
                                <Route path={this.props.match.url + '/services/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                            </section>
                            {this.state.notification.state && <section className={styles['notification']}>
                                <Notification type='done'>The service is successfully saved 😄</Notification>
                            </section>}
                        </Fragment>
                        : (
                            <NotFound></NotFound>
                        )
                }
            </ div>
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        username: state.authReducer.name,
        userRole: state.authReducer.userRole,
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

export default connect(mapStateToProps, mapDispatchToProps)(ServicesBrowse);
