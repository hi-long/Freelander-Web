import React, { Fragment } from 'react';
import * as styles from './Profile.module.css';

import Navbar from '../../components/Navbar/Navbar';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import LinkedAccount from '../../components/Profile/LinkedAccount/LinkedAccount';
import Keyword from '../../components/Keyword/Keyword';
import Category from '../../components/Category/Category';
import Review from '../../components/Review/Review';
import { Route } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import Switcher from '../../components/UI/Switcher/Switcher';
import { connect } from 'react-redux';
import axios from '../../axios-baseURL';
import SuggestionBox from '../../components/SuggestionBox/SuggestionBox';
import ServiceCard from '../../components/Card/ServiceCard/ServiceCard';
import { Link } from 'react-router-dom';
import Authentication from '../Authentication/Authentication';
import * as actions from '../store/actions/index';
import { PureComponent } from 'react';
import Loading from '../../components/Loading/Loading';
import Notification from '../../components/Notification/Notification';

const linkedAccounts = ['facebook', 'github', 'stack-overflow', 'linkedin', 'gmail', 'company']

class Profile extends PureComponent {
    state = {
        user: {
            linkedAccounts: [],
            services: [],
            jobs: [],
            skills: [],
            reviews: {},
        },
        coverFile: null,

        viewMode: 'services',

        backupUser: {},
        onEdit: false,

        skillsOnEdit: '',
        linkedAccountOnEdit: { focus: 'facebook', newAccountLinked: '' },
        onServiceDetailsShowing: false,

        suggestions: [],

        notification: {
            state: false,
            message: '',
            type: ''
        },
        userNotifications: [],

        filter: { rating: true }
    }

    componentDidMount = async () => {
        try {
            const profileId = (this.props.match.params.id)
            const responseData = await axios.get(`/${profileId}/profile`);
            if (this.props.userId) {
                const userNotifications = await axios.get(`/${this.props.userId}/notifications`);
                this.setState({
                    userNotifications: userNotifications.data
                })
            }

            const userLinkedAccounts = [];
            for (let account of linkedAccounts) {
                const foundAccount = responseData.data.linkedAccount.find(element => {
                    return element['linked_id'] === account;
                })
                if (!foundAccount) {
                    userLinkedAccounts.push({ 'linked_id': account, link: '' });
                }
            }

            const jobs = [], services = [];
            for (let data of responseData.data.services) {
                if (data.type === 'Buyer') {
                    jobs.push(data);
                } else {
                    services.push(data);
                }
            }

            const curUser = {
                ...responseData.data.basic[0],
                linkedAccounts: userLinkedAccounts.concat(responseData.data.linkedAccount),
                services: services,
                jobs: jobs,
                skills: responseData.data.skills.map(keyword => keyword.keyword),
                reviews: responseData.data.reviews
            }

            curUser.gender = curUser.gender === 1 ? 'man' : 'woman';

            this.setState({
                user: curUser,
                backupUser: curUser
            })
        } catch (err) {
            console.log(err);
        }
    }

    onSwitchEdit = () => {
        this.setState({
            onEdit: !this.state.onEdit
        })
    }

    onUnAuthSwitchViewMode = () => {
        this.setState({
            viewMode: this.state.viewMode === 'services' ? 'jobs' : 'services'
        })
    }

    onCoverEdit = event => {
        const file = (event.target.files[0])
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            this.setState({
                user: {
                    ...this.state.user,
                    cover: reader.result,
                },
                coverFile: file
            })
        }
    }

    // NOTIFICATION
    onNotificationToggle = () => {
        setTimeout(() => {
            this.setState({
                notification: {
                    state: !this.state.notification.state,
                    message: '',
                    type: ''
                }
            })
        }, 2000)
    }

    notificationConfig = (state, message, type) => {
        this.setState({
            notification: {
                state: state,
                message: message,
                type: type
            }
        })
        this.onNotificationToggle();
    }

    // GENDER
    onGenderUpdate = gender => {
        this.setState({
            user: {
                ...this.state.user,
                gender: gender
            }
        })
    }

    // DOB
    onDateOfBirthUpdate = event => {
        this.setState({
            user: {
                ...this.state.user,
                dob: event
            }
        })
    }

    // BASIC INFORMATION: USERNAME, DESCRIPTION
    onBasicFieldEdit = (event, field) => {
        const fieldValue = event.target.value;

        this.setState({
            user: {
                ...this.state.user,
                [field]: fieldValue
            }
        })
    }

    // LINKED ACCOUNT
    onAccountSelected = (account) => {
        this.setState({
            linkedAccountOnEdit: {
                ...this.state.linkedAccountOnEdit,
                focus: account
            }
        })
    }

    onLinkedAccountEdit = (event) => {
        this.setState({
            linkedAccountOnEdit: {
                ...this.state.linkedAccountOnEdit,
                newAccountLinked: event.target.textContent
            }
        })
    }

    onLinkedAccountConfirm = () => {
        const newLinkedAccountList = this.state.user.linkedAccounts.filter(element => {
            return element['linked_id'] !== this.state.linkedAccountOnEdit.focus;
        });
        this.setState({
            user: {
                ...this.state.user,
                linkedAccounts: newLinkedAccountList.concat({
                    linked_id: this.state.linkedAccountOnEdit.focus,
                    link: this.state.linkedAccountOnEdit.newAccountLinked
                })
            }
        })
    }

    // SKILL
    onAddSkill = async (event) => {
        try {
            const input = event.target.textContent;
            const responseSuggestionsData = await axios.get(`/suggestion/${input}`);
            const suggestions = [];
            for (let suggestion of responseSuggestionsData.data) {
                suggestions.push(suggestion.keyword);
            }
            this.setState({
                skillsOnEdit: input,
                suggestions: suggestions.sort((a, b) => {
                    return a.length <= b.length;
                })
            })
        } catch (err) {
            console.log(err);
        }
    }

    onDeleteSkill = async event => {
        try {
            const input = event.target.textContent;
            this.setState({
                user: {
                    ...this.state.user,
                    keywords: this.state.user.keywords.filter(keyword => keyword !== input)
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    onAddSkillConfirm = event => {
        if (this.state.user.skills.length <= 4) {
            if (!this.state.user.skills.includes(event.target.textContent)) {
                this.setState({
                    user: {
                        ...this.state.user,
                        skills: this.state.user.skills.concat(event.target.textContent)
                    },
                    skillsEdit: ''
                })
            } else {
                this.notificationConfig(true, 'You already have this skill 🙁', 'fail')
            }
        } else {
            this.notificationConfig(true, 'You only can have maximum of 5 skills 🙁', 'fail');
        }
    }


    onUpdateUserInfo = async () => {
        try {
            this.setState({
                loading: true
            })
            const userData = {
                cover: this.state.cover,
                name: this.state.user.name,
                description: this.state.user.description,
                rating: this.state.user.rating,
                gender: this.state.user.gender === 'man',
                // dob: this.state.user.dob 
            };

            if (this.state.coverFile) {
                const formData = new FormData();
                formData.append('file', this.state.coverFile);
                formData.append('upload_preset', 'Freelander_Service_Card');
                const responseImageUploadedData = await axios.post(`https://api.Cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUDNAME}/image/upload`, formData);
                const newCoverURL = responseImageUploadedData.data.secure_url;
                userData.cover = newCoverURL;
                this.props.setCover(userData.cover)
            }

            const skills = this.state.user.skills.map(skill => {
                return [this.state.user.user_id, skill]
            });
            const userLinkedAccounts = [];
            for (let account of this.state.user.linkedAccounts) {
                if (account.link !== '') {
                    userLinkedAccounts.push(
                        [this.state.user.user_id, account.linked_id, account.link]
                    )
                }
            }
            const editData = await axios.put(`/${this.state.user.user_id}/edit`, {
                userData: userData,
                skills: skills,
                linkedAccounts: userLinkedAccounts
            });

            this.setState({
                onEdit: !this.state.onEdit,
                loading: false
            })
            this.notificationConfig('true', 'Your profile is successfully updated 😄', 'done')
        } catch (err) {
            console.log(err);
        }
    }

    onCancelUpdateUserInfo = () => {
        this.setState({
            user: this.state.backupUser,
            onEdit: !this.state.onEdit
        })
    }

    onShowingServiceDetails = (serviceId) => {
        this.props.history.push(this.props.match.url + `/${serviceId}`);
        this.props.onServiceDetailsHandle();
        this.setState({
            serviceDetailsIsShowing: true
        })
    }

    onHidingServiceDetails = () => {
        this.setState({
            serviceDetailsIsShowing: false
        })
        this.props.onServiceDetailsHandle();
        this.props.history.goBack();
    }

    onReviewsFilter = property => {
        this.setState({
            filter: {
                ...this.state.filter,
                [property]: !this.state.filter[property]
            }
        })
    }

    onAuthButtonClicked = () => {
        this.props.authCompToggle(!this.props.authCompShowing);
    }

    render() {
        const currentProfileId = this.props.match.params.id;
        // COVER EDIT
        const coverEdit = this.state.onEdit && <div className={styles['cover-edit']}>
            <Input
                customStyle='image-uploader'
                elementType='file'
                elementConfig={{
                    accept: "image/png, image/jpeg",
                    required: true,
                    multiple: false,
                    id: 'images'
                }}
                changed={event => this.onCoverEdit(event)}></Input>
            <label htmlFor='images'>
                <img alt='' src={process.env.PUBLIC_URL + '/images/ImageUploader/upload.png'}></img>
            </label>
        </div>;
        // USERNAME EDIT

        const auth = this.props.authCompShowing ? <Authentication onAuthEscape={this.onAuthEscape}></Authentication> : null;

        const usernameEdit = this.state.onEdit && (
            <div className={styles['main-content__profile__overview__edit__confirm']}>
                <Input
                    customStyle='profile__overview'
                    elementType='input'
                    value={this.state.user.name}
                    elementConfig={{
                        placeholder: 'Enter your new name'
                    }}
                    changed={(event) => this.onBasicFieldEdit(event, 'name')}
                ></Input>
            </div>
        );
        // DESCRIPTION
        const description = this.state.onEdit ? (
            <Input
                customStyle='profile__description'
                elementType='textarea'
                elementConfig={{
                    required: true,
                    rows: 10
                }}
                value={this.state.user.description}
                changed={(event) => this.onBasicFieldEdit(event, "description")}></Input>
        ) : (
                <p>{this.state.user.description}</p>
            )

        // LINKED ACCOUNT
        const userLinkedAccounts = this.state.onEdit ? linkedAccounts : this.state.user.linkedAccounts;
        const linkedAccountsEdit = this.state.onEdit && (
            <div className={styles['linked-account__edit']}>
                <p className={styles['linked-account__edit__input']} contentEditable="true" suppressContentEditableWarning={true} onInput={this.onLinkedAccountEdit}>{this.state.user.linkedAccounts.find(element => element['linked_id'] === this.state.linkedAccountOnEdit.focus).link}</p>
                <Button customStyle='profile__overview' clicked={this.onLinkedAccountConfirm}>Confirm</Button>
            </div>
        )
        // SKILLS EDIT 
        const skillsEdit = this.state.onEdit && (
            <div className={styles['linked-account__edit']}>
                <p className={styles['linked-account__edit__input']} contentEditable="true" suppressContentEditableWarning={true} onInput={this.onAddSkill}>{ }</p>
            </div>
        );

        const userServices = this.state.user.services.filter(service => service.type === this.props.userRole);

        const saveButton = this.state.onEdit && <Button
            customStyle='profile-edit__confirm'
            clicked={this.onUpdateUserInfo}>Save</Button>

        const cancelButton = this.state.onEdit && <Button
            customStyle='profile-edit__cancel'
            clicked={this.onCancelUpdateUserInfo}>Cancel :C</Button>

        let services = this.state.viewMode === 'services' ? this.state.user.services : this.state.user.jobs;
        if (services !== undefined && services.length === 0) {
            services = undefined
        }

        let reviews = this.state.viewMode === 'services' ? this.state.user.reviews.services
            : this.state.user.reviews.jobs;
        if (reviews !== undefined && reviews.length === 0) {
            reviews = undefined
        }

        const isLoading = this.state.loading;
        const onSD = this.props.onServiceDetails;
        return (

            <Fragment >
                {auth}
                {/* <Loading>Loading ...</Loading> */}
                {this.state.loading && <Loading>Uploading</Loading>}
                <div className={[styles['container'], styles[isLoading || onSD ? 'blur' : '']].join(' ')}>
                    {/* NAVBAR */}
                    <section
                        className={styles['navbar']}>
                        <Navbar
                            onAuthInit={this.onAuthButtonClicked}
                            onUserRoleSwitch={this.props.onUserRoleSwitch}
                            notifications={this.state.userNotifications}></Navbar>
                    </section>
                    {/* MAIN CONTENT */}
                    <section className={[styles['main-content'], styles[this.state.loading ? 'blur' : '']].join(' ')}>
                        <div className={styles['main-content__profile']}>
                            {/* OVERVIEW */}
                            <div className={styles['main-content__profile__overview']}>
                                {coverEdit}
                                <img
                                    className={styles['main-content__profile__overview__profile-image']}
                                    alt='' src={this.state.user.cover}></img>
                                <h2 className={styles['main-content__profile__overview__username']}>{this.state.user.name}</h2>
                                {currentProfileId === this.props.userId && <img
                                    onClick={this.state.onEdit ? this.onCancelUpdateUserInfo : this.onSwitchEdit}
                                    className={styles['main-content__profile__overview__edit']}
                                    alt='' src={process.env.PUBLIC_URL + '/images/profile/edit.png'}></img>}
                                {usernameEdit}
                            </div>
                            {this.state.onEdit ?
                                <Fragment>
                                    <div className={styles['gender']}>
                                        {['man', 'woman'].map(gender => (
                                            <img alt=''
                                                onClick={() => this.onGenderUpdate(gender)}
                                                src={process.env.PUBLIC_URL + `/images/Profile/${gender}${this.state.user.gender === gender ? '-active' : ''}.png`}></img>
                                        ))}
                                    </div>
                                    <b style={{ marginLeft: '1rem', marginBottom: '1rem' }}>Date of birth</b>
                                    {/* <div className={styles['dob']}>
                                        <Calendar
                                            onChange={(event) => this.onDateOfBirthUpdate(event)}></Calendar>
                                    </div> */}
                                </Fragment>
                                : (
                                    <Fragment>
                                        <div className={styles['gender']}>
                                            <img alt='' src={process.env.PUBLIC_URL + `/images/Profile/${this.state.user.gender}.png`}></img>
                                        </div>
                                        {/* <div className={styles['dob']}>
                                            <span>{this.state.user.dob}</span>
                                        </div> */}
                                    </Fragment>
                                )}
                            {/* DESCRIPTION */}
                            <div className={styles['main-content__description']}>
                                <div className={styles['main-content__description__description']}>
                                    <header className={styles['description__header']}>
                                        <b>Description</b>
                                    </header>
                                    <div>
                                        {description}
                                    </div>
                                </div>
                                {/* LINKED ACC */}
                                <div className={styles['main-content__description__link-account']}>
                                    <header className={styles['description__header']}>
                                        <b>Linked accounts</b>
                                    </header>
                                    <div className={styles['link-account__list']}>
                                        {userLinkedAccounts.map((linkedAccount, id) => {
                                            return <LinkedAccount
                                                onEdit={this.state.onEdit && this.state.linkedAccountOnEdit.focus === linkedAccount}
                                                key={id}
                                                value=''
                                                attachedLink={linkedAccount.link}
                                                clicked={() => this.onAccountSelected(linkedAccount)}
                                                thirdPartyIcon={this.state.onEdit ? linkedAccount : linkedAccount.linked_id}
                                            ></LinkedAccount>
                                        })}
                                    </div>
                                    {linkedAccountsEdit}
                                </div>
                                {/* SKILLS */}
                                <div className={styles['main-content__description__skills']}>
                                    <header className={styles['description__header']}>
                                        <b>Skills</b>
                                    </header>
                                    <div className={styles['main-content__description__skills__list']}>
                                        {this.state.user.skills.map(keyword => (
                                            <Keyword
                                                key={keyword}
                                                directable={!this.state.onEdit}
                                                editable={this.state.onEdit ? true : false}
                                                delete={event => this.onDeleteSkill(event)}>{keyword}</Keyword>
                                        ))}
                                    </div>
                                    {skillsEdit}
                                    {this.state.onEdit && <SuggestionBox keywords={this.state.suggestions} clicked={(event) => this.onAddSkillConfirm(event)}></SuggestionBox>}
                                </div>
                                {saveButton}
                                {cancelButton}
                            </div>
                        </div>
                        {/* BUSINESS */}
                        <div className={styles['main-content__business']}>
                            <div className={styles['main-content__business__services']}>
                                <header className={styles['main-content__business__header']}>
                                    <h3 className={styles['main-content__business__header__title']}>{this.state.viewMode === 'services' ? 'Services' : 'Jobs'}</h3>
                                    <Switcher customStyle='profile'
                                        changeRole='false'
                                        clicked={this.onUnAuthSwitchViewMode}></Switcher>
                                </header>
                                {(services && !this.state.loading) ? (
                                    <Category
                                        customStyle=''
                                        to='/'
                                        numOfSlides={services.length === 1 ? '1' : '2'}
                                        numOfScroll='1'>
                                        {services.map((service, id) => {
                                            return <ServiceCard
                                                key={id}
                                                customGalleryStyle='profile-business'
                                                imagesToShow={1}
                                                clicked={() => this.onShowingServiceDetails(service.service_id)}
                                                cardType='service'
                                                images={service.images}
                                                cover={this.state.user.cover}
                                                name={this.state.user.name}
                                                title={service.title}
                                                description={service.description}
                                                numberOfRaters='20'
                                                type={service.type}
                                                min_price={service.min_price}></ServiceCard>
                                        })}
                                    </Category>
                                ) : (
                                        <div className={styles['no-reviews']}>
                                            There is no jobs 😐
                                            <br></br>
                                            {currentProfileId === this.props.userId && (
                                                <Fragment>
                                                    <br></br>
                                                    <Link to={`/${this.props.userId}/service-builder`}>Create new one 😃</Link>
                                                </Fragment>
                                            )}
                                        </div>
                                    )}
                            </div>
                            {/* REVIEWS */}
                            <div className={styles['main-content__reviews']}>
                                <header className={styles['main-content__business__header']}>
                                    <h3 className={styles['main-content__business__header__title']}>
                                        Reviews for {this.state.viewMode}</h3>
                                </header>
                                <div className={styles['main-content__reviews__reviews']}>
                                    {reviews ?
                                        reviews.map(review => (
                                            <Review key={review.review_id} customStyle='user-review' {...review} {...review.user}></Review>
                                        ))
                                        : (
                                            <div className={styles['no-reviews']}>There is no reviews 😐</div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </section>

                </div >
                <section className={styles['service-details']}>
                    <Route path={this.props.match.url + '/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                </section>
                {this.state.notification.state && <section className={styles['notification']}>
                    <Notification type={this.state.notification.type}>{this.state.notification.message}</Notification>
                </section>}
            </Fragment >
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        userCover: state.authReducer.cover,
        authCompShowing: state.authReducer.authCompToggle,
        searchKeywords: state.otherReducer.searchKeywords,
        onServiceDetails: state.otherReducer.onServiceDetails
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSearching: (searchKeywords) => dispatch(actions.onSearching(searchKeywords)),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth)),
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch()),
        setCover: cover => dispatch(actions.setCover(cover))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);