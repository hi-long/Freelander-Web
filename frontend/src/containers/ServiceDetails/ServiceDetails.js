import React, { Component, Fragment } from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../components/Gallery/Gallery';
import Keyword from '../../components/Keyword/Keyword';
import Button from '../../components/UI/Button/Button';
import Input from '../../components/UI/Input/Input';
import Review from '../../components/Review/Review';
import * as styles from './ServiceDetails.module.css';
import NewReview from '../../components/Review/NewReview/NewReview';
import BasicFieldComp from '../../components/ServiceDetails/BasicFieldComp/BasicFieldComp';
import { withRouter } from 'react-router-dom';
import axios from '../../axios-baseURL';
import * as timeago from 'timeago.js';
import SuggestionBox from '../../components/SuggestionBox/SuggestionBox';
import { v4 as uuidv4 } from 'uuid';
import BasicFieldEdit from '../../components/ServiceDetails/BasicFieldEdit/BasicFieldEdit';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index';
import Notification from '../../components/Notification/Notification';
import Loading from '../../components/Loading/Loading';

class ServiceDetails extends Component {
    state = {
        service: {},
        owner: {},
        images: [],
        deletedImages: [],
        uploadedImages: [],
        keywords: [],
        reviews: [],
        keywordSuggestions: [],
        newReview: {
            rating: 0,
            content: '',
            review_id: uuidv4().substring(0, 11)
        },
        editedReview: {
            review_id: '',
            content: '',
            rating: null
        },
        relatedServices: [],
        contactMessage: '',
        onEdit: false,
        userSavedList: [],
        isSaved: false,
        notification: {
            state: false,
            message: '',
            type: ''
        },
        uploadingEditedInfo: false
    }

    componentDidMount = async () => {
        try {
            const serviceId = this.props.match.params.id;
            const responseData = await axios.get(`/services/${serviceId}`);
            console.log(serviceId)

            const curService = responseData.data.service[0];
            const serviceOwner = responseData.data.owner[0];
            const reviews = responseData.data.reviews;

            const relatedServices = responseData.data.relatedServices;
            const keywords = responseData.data.keywords.map(keyword => keyword.keyword);

            const serviceImages = responseData.data.images;

            this.setState({
                service: curService,
                owner: serviceOwner,
                images: this.state.images.concat(serviceImages),
                reviews: reviews,
                relatedServices: relatedServices,
                keywords: (keywords)
            })
        } catch (err) {
            console.log(err);
        }
    }

    componentDidUpdate = async (prevProps) => {
        try {
            const prevServiceId = prevProps.match.params.id;
            const currentServiceId = this.props.match.params.id;
            if (currentServiceId !== prevServiceId) {
                const responseData = await axios.get(`/services/${currentServiceId}`);

                const curService = responseData.data.service[0];
                const serviceOwner = responseData.data.owner[0];
                const reviews = this.props.userId ? responseData.data.reviews : [];

                const relatedServices = responseData.data.relatedServices;

                const keywords = responseData.data.keywords.map(keyword => keyword.keyword);

                const serviceImages = responseData.data.images;

                this.setState({
                    service: curService,
                    owner: serviceOwner,
                    images: [].concat(serviceImages),
                    reviews: reviews,
                    relatedServices: relatedServices,
                    keywords: (keywords)
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    onContactMessage = (event) => {
        this.setState({
            contactMessage: event.target.value
        })
    }

    onEditSwitch = () => {
        this.setState({
            onEdit: !this.state.onEdit
        })
    }

    onBasicFieldEdit = (event, field) => {
        this.setState({
            service: {
                ...this.state.service,
                [field]: event.target.value
            }
        })
    }

    onAddKeywords = async (event) => {
        try {
            const input = event.target.value;
            const responseSuggestionsData = await axios.get(`/suggestion/${input}`);
            const suggestions = [];
            for (let suggestion of responseSuggestionsData.data) {
                suggestions.push(suggestion.keyword);
            }
            this.setState({
                keywordSuggestions: suggestions.sort((a, b) => {
                    return a.length <= b.length;
                })
            })
        } catch (err) {
            console.log(err);
        }
    }

    onAddKeywordsConfirm = event => {
        if (!this.state.keywords.includes(event.target.textContent) && this.state.keywords.length < 7) {
            this.setState({
                keywords: this.state.keywords.concat(event.target.textContent)
            })
        } else {
            this.setState({
                notification: {
                    state: true,
                    message: 'You can have maximum 7 search tags'
                }
            })
            this.onNotificationToggle();
        }
    }

    onDeleteKeyword = (name) => {
        this.setState({
            keywords: this.state.keywords.filter(element => element !== name)
        })
    }

    onEditSave = async () => {
        try {
            if (this.state.keywords.length === 0) {
                this.setState({
                    notification: {
                        state: true,
                        message: 'Your service must have search tags ☹',
                        type: 'fail'
                    }
                })
                this.onNotificationToggle();
            } else if (this.state.images.length === 0) {
                this.setState({
                    notification: {
                        state: true,
                        message: 'Your job must have at least one picture ☹',
                        type: 'fail'
                    }
                })
            } else {
                this.setState({
                    uploadingEditedInfo: true
                })
                const imageFiles = this.state.uploadedImages.map(img => img.file);
                const imagesUploaded = [];
                for (let imageFile of imageFiles) {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    formData.append('upload_preset', 'Freelander_Service_Card');
                    const responseImageUploadedData = await axios.post(`https://api.Cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUDNAME}/image/upload`, formData)
                    imagesUploaded.push({ public_id: responseImageUploadedData.data.public_id, imageUrl: responseImageUploadedData.data.secure_url });
                }
                const images = this.state.images.concat(imagesUploaded).map(image => {
                    return {
                        imageUrl: image.imageUrl,
                        public_id: image.public_id
                    }
                });
                const keywords = this.state.keywords.map(keyword => {
                    return {
                        service_id: this.state.service.service_id,
                        name: keyword
                    }
                });

                const editRequest = await axios.put(`/services/${this.state.service.service_id}/edit`, {
                    service: this.state.service,
                    images: images,
                    keywords: keywords
                })

                for (let deletedImage of this.state.deletedImages) {
                    let deletedImg = await axios.post(`/image/destroy`, { public_id: deletedImage })
                }

                this.setState({
                    onEdit: !this.state.onEdit,
                    uploadingEditedInfo: false
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    onEditCancel = () => {
        this.setState({
            onEdit: !this.state.onEdit
        })
    }

    // PRICE EDIT
    onPriceEdit = event => {
        this.setState({
            service: {
                ...this.state.service,
                min_price: event.target.value
            }
        })
    }

    // NEW REVIEW
    onRatingInput = event => {
        this.setState({
            newReview: {
                ...this.state.newReview,
                rating: event.target.value
            }
        })
    }

    onContentInput = event => {
        this.setState({
            newReview: {
                ...this.state.newReview,
                content: event.target.value
            }
        })
    }

    onRelatedServiceRedirect = (service_id) => {
        const curUrl = this.props.match.path;
        const newUrl = curUrl.substring(0, curUrl.length - 3) + service_id;
        this.props.history.replace(newUrl);
    }

    onNewReviewUpload = async event => {
        try {
            event.preventDefault();
            const newReviewData = {
                service_id: this.state.service.service_id,
                user_id: this.props.userId,
                review_id: this.state.newReview.review_id,
                rating: this.state.newReview.rating,
                content: this.state.newReview.content,
            }
            const serviceOwner = this.state.service.owner;
            const newReview = await axios.post(`/services/${this.state.service.service_id}/reviews/new`, { newReviewData, serviceOwner });
            this.setState({
                reviews: [{
                    ...this.state.newReview,
                    cover: this.props.userCover,
                    name: this.props.username
                }, ...this.state.reviews],
                newReview: {
                    ...this.state.newReview,
                    review_id: uuidv4().substring(0, 11)
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    reviewOnFocus = (review_id, content, rating) => {
        this.setState({
            editedReview: {
                review_id, content, rating
            }
        })
    }

    onReviewEdit = (event, review_id) => {
        this.setState({
            editedReview: {
                review_id: review_id,
                content: event.target.value
            }
        })
    }

    onReviewEditSave = async reviewId => {
        try {
            const newContent = this.state.editedReview.content;
            const editedReviewData = await axios.put(`/reviews/${reviewId}`, { editedReview: this.state.editedReview });
            const editedReview = this.state.reviews.find(review => review.review_id === reviewId);
            editedReview.content = newContent;
            editedReview.date = new Date();
            const updatedReviewsList = [editedReview, ...this.state.reviews.filter(review => review.review_id !== reviewId)];
            this.setState({
                reviews: updatedReviewsList,
                notification: {
                    state: true,
                    message: editedReviewData.data.message
                }
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err)
        }
    }

    onReviewDelete = async (reviewId) => {
        try {
            const deletedReview = await axios.delete(`/reviews/${reviewId}`);
            this.setState({
                reviews: this.state.reviews.filter(review => review.review_id !== reviewId),
                notification: {
                    state: true,
                    message: deletedReview.data.message
                }
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err);
        }
    }

    // NEW CONVERSATIONS
    onNewContact = async () => {
        try {
            const userId = this.props.userId;
            const newContact = await axios.post(`/${userId}/messenger/new`, {
                from_id: userId,
                to_id: this.state.service.owner,
                init_service: this.state.service.service_id,
                contact_message: this.state.contactMessage
            })
            this.props.history.push(`/${userId}/messenger`);
            this.props.onServiceDetailsHandle();
        } catch (err) {
            console.log(err);
        }
    }

    // IMAGE
    imagesOnUpload = event => {
        const imagesLength = this.state.images.concat(this.state.uploadedImages).length + event.target.files.length;
        if (imagesLength > 5) {
            this.setState({
                notification: {
                    state: true,
                    message: 'Your service only can have maximum of 5 pictures ☹',
                    type: 'fail'
                }
            })
            this.onNotificationToggle();
        } else {
            for (let file of event.target.files) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    this.setState({
                        uploadedImages: this.state.uploadedImages.concat({ imageUrl: reader.result, file: file }).reverse()
                    })
                }
            }
        }
    }

    imageOnDelete = (imgSrc) => {
        this.setState({
            uploadedImages: this.state.uploadedImages.filter(img => {
                return img.imageUrl !== imgSrc
            }),
            images: this.state.images.filter(img => img.imageUrl !== imgSrc)
        })
    }

    onAddToSaveList = async () => {
        try {
            const userId = this.props.userId, serviceId = this.state.service.service_id;
            const addToSavedList = await axios.post(`/${userId}/saved-list/new`, { serviceId });
            this.onNotificationToggle();
            this.setState({
                notification: {
                    state: true,
                    message: addToSavedList.data.message
                },
                isSaved: true
            })
        } catch (err) {
            console.log(err);
        }
    }

    onDeleteFromSavedList = async () => {
        try {
            const userId = this.props.userId, serviceId = this.state.service.service_id;
            const responseData = await axios.delete(`/${userId}/saved-list/${serviceId}`);
            this.setState({
                notification: {
                    status: true,
                    message: responseData.data.message
                },
                isSaved: false
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

    onServiceDelete = async () => {
        try {
            const service_id = this.state.service.service_id;
            const deleteData = await axios.delete(`/services/${service_id}`);
            console.log(deleteData)
            this.props.history.goBack();
            this.props.onServiceDetailsHandle();
            this.setState({
                notification: {
                    status: true,
                    message: deleteData.data.message
                }
            })
            this.onNotificationToggle();
        } catch (err) {
            console.log(err);
        }
    }

    onAuthButtonClicked = () => {
        this.props.authCompToggle(!this.props.authCompShowing);
    }

    render() {
        let title, images, description, loveWorkingHere, yourSkillsAndExperience, youAreBestChoice;
        images = this.state.onEdit ?
            <ImageUploader
                images={this.state.images.concat(this.state.uploadedImages)}
                imagesOnUpload={this.imagesOnUpload}
                imageOnDelete={this.imageOnDelete}
            ></ImageUploader>
            : null;
        if (this.state.onEdit) {
            title = <Input
                customStyle='title'
                elementType='input'
                value={this.state.service.title}
                changed={event => this.onBasicFieldEdit(event, 'title')}></Input>
            description = <BasicFieldEdit
                header='Description'
                value={this.state.service.description}
                onEdit={event => this.onBasicFieldEdit(event, 'description')}
            ></BasicFieldEdit>

            loveWorkingHere = <BasicFieldEdit
                header='Why you will love working here'
                value={this.state.service.love_working_here}
                onEdit={event => this.onBasicFieldEdit(event, 'love_working_here')}
            ></BasicFieldEdit>

            yourSkillsAndExperience = <BasicFieldEdit
                header='Your skills and experience'
                value={this.state.service.skills_and_experiences}
                onEdit={event => this.onBasicFieldEdit(event, 'skills_and_experiences')}
            ></BasicFieldEdit>

            youAreBestChoice = <BasicFieldEdit
                header='Why you are the best choice'
                value={this.state.service.why_best_choice}
                onEdit={event => this.onBasicFieldEdit(event, 'why_best_choice')}
            ></BasicFieldEdit>
        } else {
            title = <h2> {this.state.service.title}</h2>

            description = <BasicFieldComp
                header='Description'
            >{this.state.service.description}</BasicFieldComp>

            loveWorkingHere = <BasicFieldComp
                header='Why you will love working here'
            >{this.state.service.love_working_here}</BasicFieldComp>

            yourSkillsAndExperience = <BasicFieldComp
                header='Your skills and experience'
            >{this.state.service.skills_and_experiences}</BasicFieldComp>

            youAreBestChoice = <BasicFieldComp
                header='Why you are the best choice'
            >{this.state.service.why_best_choice}</BasicFieldComp>
        }

        const priceEdit = this.state.onEdit && <Input
            elementType='input'
            elementConfig={{
                type: 'number',
                max: 5,
                min: 0
            }}
            value={this.state.service.min_price}
            changed={event => this.onPriceEdit(event)}
        ></Input>

        const serviceOwner = this.state.service.owner;
        const userId = this.props.userId;

        const editButton = serviceOwner === userId && (
            <Button clicked={!this.state.onEdit ? this.onEditSwitch : this.onEditSave}>{!this.state.onEdit ? 'Edit' : 'Save'}</Button>
        )
        const deleteButton = serviceOwner === userId &&
            <Button clicked={this.onServiceDelete} > Delete {this.state.service.type === 'Seller' ? 'service' : 'job'}</Button>;

        const buttons = !this.state.onEdit ? (
            <Fragment>
                {serviceOwner !== userId && (
                    <Fragment>
                        <div className={styles['contact']}>
                            <Input
                                elementType='input'
                                elementConfig={{
                                    minLength: 5,
                                    placeholder: 'Send something :D'
                                }}
                                value={this.state.contactMessage}
                                changed={this.onContactMessage}></Input>
                            <Button clicked={this.onNewContact} disabled={this.state.contactMessage === ''}>Contact</Button>
                        </div>
                        <Button clicked={this.state.isSaved ? this.onDeleteFromSavedList : this.onAddToSaveList}>{this.state.isSaved ? 'Delete from saved list' : 'Save service'}</Button>
                    </Fragment>
                )}
                {editButton}
                {deleteButton}
            </Fragment>
        ) : (
                <Fragment>
                    {editButton}
                    <Button clicked={this.onEditCancel}>{!this.state.onEdit ? '' : 'Cancel'}</Button>
                </Fragment>
            )

        const keywords = this.state.onEdit && (<Input elementType='input' elementConfig={{
            type: 'text',
            placeholder: 'Add your search tags',
            value: ''
        }} pressed={(event) => this.onAddKeywords(event)}></Input>)

        return (
            <div className={[styles['container'], styles[this.props.authCompShowing ? 'blur' : '']].join(' ')}>
                {/* NAVBAR */}
                <section className={styles['navbar']}>
                    <img
                        onClick={this.props.close}
                        alt=''
                        src={process.env.PUBLIC_URL + '/images/ServiceDetails/back.png'}
                    ></img>
                </section>
                {/* CONTENT */}
                {this.state.uploadingEditedInfo && <Loading>Please wait a bit 😃</Loading>}
                <section className={[styles['details'], styles[this.state.uploadingEditedInfo ? 'blur' : '']].join(' ')}>
                    <section className={styles['details__content']}>
                        {/* TITLE */}
                        <div className={styles['details__content__title']}>
                            <header>
                                {title}
                            </header>
                        </div>
                        {/* GALLERY */}
                        <div className={styles['gallery']}>{!this.state.onEdit &&
                            <Gallery
                                customStyle='service-details'
                                imagesToShow={1}
                                images={this.state.images.concat(this.state.uploadedImages)}
                                deleteAble={this.state.onEdit}
                                onDeleteImg={this.onDeleteImg}></Gallery>}
                            {images}
                        </div>
                        {/* DETAILS */}
                        <div className={styles['details__content__category']}>
                            <span><b>Category</b>
                                <br></br>
                                <br></br>
                                <Link to={`/browse?&keyword=${this.state.service.category}&page=0&user-role=${this.props.userRole}&user-id=${this.props.userId}`}>
                                    {this.state.service.category}
                                </Link></span>
                            <br></br>
                            <span><b>Posted</b> {timeago.format(this.state.service.posted_time)}</span>
                        </div>
                        <div className={styles['details__content__description']}>
                            <div className={styles['details__content__description__description']}>
                                {description}
                            </div>
                            {this.state.service.type === 'Buyer' && (
                                <Fragment>
                                    <div className={styles['details__content__description__company']}>
                                        {loveWorkingHere}
                                    </div>
                                    <div className={styles['details__content__description__skills']}>
                                        {yourSkillsAndExperience}
                                    </div>
                                </Fragment>
                            )}
                            {this.state.service.type === 'Seller' && (
                                <div className={styles['details__content__description__self-convince']}>
                                    {youAreBestChoice}
                                </div>
                            )}
                        </div>
                        {/* PRICE */}
                        <div className={styles['details__content__price']}>
                            <h4>{this.state.service.type === 'Seller' ? 'Starting price' : 'Starting salary per month'}</h4>
                            <p style={{ lineHeight: '2rem' }}><img alt='' src={process.env.PUBLIC_URL + '/images/ServiceDetails/money.png'}></img>{priceEdit} <span>{!this.state.onEdit ? this.state.service.min_price : ''}$</span></p>
                        </div>
                        <div className={styles['details__content__skills']}>
                            <label><h4>Search tags</h4></label>
                            <div>
                                {keywords}
                                {this.state.onEdit && <SuggestionBox
                                    customStyle='service-details'
                                    keywords={this.state.keywordSuggestions}
                                    clicked={(event) => this.onAddKeywordsConfirm(event)}
                                    directable={false}
                                ></SuggestionBox>}
                            </div>
                            {this.state.keywords.concat(this.state.onEdit.newKeywords).map(keyword => {
                                if (keyword !== undefined) {
                                    return <Keyword
                                        customStyle={this.state.onEdit ? 'keyword--editable' : ''}
                                        id={keyword}
                                        key={keyword}
                                        editable={this.state.onEdit ? true : false}
                                        directable={this.state.onEdit ? false : true}
                                        userRole={this.props.userRole}
                                        userId={this.props.userId}
                                        delete={() => this.onDeleteKeyword(keyword)}>{keyword}</Keyword>
                                }
                            })}
                        </div>
                    </section>
                    {/* UTIL */}
                    <section className={styles['details__contact']}>
                        <div className={styles['owner']}>
                            <div className={styles['owner__cover']}>
                                <img alt='...' src={this.state.owner.cover}></img>
                            </div>
                            <div className={styles['owner__info']}>
                                <h3>{this.state.owner.name}</h3>
                                <span><img alt='' src={process.env.PUBLIC_URL + '/images/Profile/star.png'}></img> {this.state.owner.rating}</span>
                            </div>
                        </div>
                        <div className={styles['details__contact__ways']}>
                            {this.props.userId ? buttons :
                                <Button className={styles['auth-init']} clicked={this.onAuthButtonClicked}>
                                    Sign in to contact the owner
                                </Button>}
                        </div>
                    </section>
                </section>
                {/* REVIEW */}
                <section className={styles['reviews']}>
                    <div className={styles['reviews__wrapper']}>
                        <header className={styles['reviews__header']}>
                            <h2>Reviews</h2>
                        </header>
                        <div className={styles['reviews__list']}>
                            {this.state.reviews.length !== 0 ?
                                this.state.reviews.map((review, id) => (
                                    <Review
                                        key={id}
                                        style={{ margin: '0', marginBottom: '0.5rem' }}
                                        {...review}
                                        customStyle='user-review'
                                        cover={review.cover}
                                        name={review.name}
                                        editable={this.props.userId === review.user_id}
                                        {...review}
                                        editVal={this.state.editedReview.content}
                                        reviewOnFocus={this.reviewOnFocus}
                                        onReviewEdit={this.onReviewEdit}
                                        onReviewDelete={this.onReviewDelete}
                                        onReviewEditSave={this.onReviewEditSave}
                                        date={(timeago.format(new Date(review.date)))}></Review>
                                )) : (
                                    <div className={styles['no-review']}>
                                        <h3>There is no reviews 😐</h3>
                                    </div>
                                )}
                        </div>
                        <div className={styles['review__create']}>
                            {this.props.userId ?
                                this.props.userId !== this.state.service.owner ?
                                    <NewReview
                                        userCover={this.props.userCover}
                                        username={this.props.username}
                                        ratingVal={this.state.newReview.rating}
                                        contentVal={this.state.newReview.content}
                                        onRatingInput={(event) => this.onRatingInput(event)}
                                        onContentInput={(event) => this.onContentInput(event)}
                                        onUpload={(event) => this.onNewReviewUpload(event)}></NewReview>
                                    : null : (
                                    <div className={styles['auth-suggestion']}>
                                        <Button clicked={this.onAuthButtonClicked} >
                                            Sign in or sign up to review :D
                                        </Button>
                                    </div>
                                )}
                        </div>
                    </div>
                </section>
                {/* RELATED JOBS */}
                <section className={styles['related-jobs']}>
                    <div className={styles['related-jobs__list']}>
                        <h2>Other jobs from this seller/buyer </h2>
                        {this.state.relatedServices.filter(service => service.service_id !== this.state.service.service_id).map(service => {
                            return (
                                <p onClick={() => this.onRelatedServiceRedirect(service.service_id)} key={service.service_id}>{service.title}</p>
                            )
                        })}
                    </div>
                </section>
                {this.state.notification.state && <section className={styles['notification']}>
                    <Notification type={this.state.notification.type}>{this.state.notification.message}</Notification>
                </section>}
            </div >
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
        authCompShowing: state.authReducer.authCompToggle
    }
}

const mapDispatchToProps = dispatch => {
    return {
        pageIsLoading: () => dispatch(actions.loading()),
        pageLoaded: () => dispatch(actions.loaded()),
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(ServiceDetails));
