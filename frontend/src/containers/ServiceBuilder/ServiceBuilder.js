import React, { Component, Fragment } from 'react';
import * as styles from './ServiceBuilder.module.css';

import Navbar from '../../components/Navbar/Navbar';
import Input from '../../components/UI/Input/Input';
import Keyword from '../../components/Keyword/Keyword';
import RangeSlider from '../../components/RangeSlider/RangeSlider';
import { connect } from 'react-redux';
import axios from '../../axios-baseURL';
import { Route } from 'react-router';
import ServiceDetails from '../ServiceDetails/ServiceDetails';
import * as actions from '../store/actions/index';
import { v4 as uuidv4 } from 'uuid';
import ImageUploader from '../../components/ImageUploader/ImageUploader';
import Loading from '../../components/Loading/Loading';
import Select from '../../components/UI/Select/Select';
import Notification from '../../components/Notification/Notification';
import Intro from '../../components/Intro/Intro';

class ServiceBuilder extends Component {
    state = {
        categoryOnShowing: 'buying',
        categories: [],
        jobs: [],
        keywords: [],
        uploading: false,
        newService: {
            keywords: [],
            uploadedImages: [],
            basic: {
                service_id: uuidv4().substring(0, 11),
                title: '',
                description: '',
                category: '',
                job: '',
                skills_and_experiences: '',
                love_working_here: '',
                why_best_choice: '',
                require_level: '',
                min_price: 0
            }
        },
        notification: {
            state: false,
            message: '',
            type: ''
        },
        userNotifications: []
    }

    componentDidMount = async () => {
        try {
            const responseData = await axios.get(`/category`);
            const categories = [];
            const userId = this.props.userId;
            const userNotifications = await axios.get(`/${userId}/notifications`);

            for (let data of responseData.data) {
                categories.push(data.category);
            }
            this.setState({
                categories: this.state.categories.concat(categories),
                userNotifications: userNotifications.data
            })
        } catch (err) {
            console.log(err);
        }
    }

    onSwitchMode = (mode) => {
        this.setState({
            categoryOnShowing: mode
        })
    }

    onInformationInput = (event, element) => {
        this.setState({
            newService: {
                ...this.state.newService,
                basic: {
                    ...this.state.newService.basic,
                    [element]: event.target.value
                }
            }
        })
    }

    onCategorySelected = async (event) => {
        try {
            const category = event.target.textContent;
            const responseData = await axios.get(`/${category}/job`);
            const jobs = [];
            for (let data of responseData.data) {
                jobs.push(data.job);
            }
            this.setState({
                jobs: jobs
            })
            this.setState({
                keywords: [],
                newService: {
                    ...this.state.newService,
                    basic: {
                        ...this.state.newService.basic,
                        category: category,
                        job: ''
                    }
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    onJobSelected = async event => {
        try {
            const job = event.target.textContent;
            const responseData = await axios.get(`/${job}/keywords`);
            const keywords = [];
            for (let data of responseData.data) {
                keywords.push(data.keyword);
            }
            this.setState({
                newService: {
                    ...this.state.newService,
                    basic: {
                        ...this.state.newService.basic,
                        job: job
                    },
                    keywords: []
                },
                keywords: [].concat(keywords)
            })
        } catch (err) {
            console.log(err);
        }
    }

    keywordSelected = (keywordName) => {
        const newServiceKeywords = this.state.newService.keywords;
        if (newServiceKeywords.length < 5) {
            if (newServiceKeywords.includes(keywordName)) {
                this.setState({
                    newService: {
                        ...this.state.newService,
                        keywords: newServiceKeywords.filter(keyword => keyword !== keywordName)
                    }
                })
            } else {
                this.setState({
                    newService: {
                        ...this.state.newService,
                        keywords: newServiceKeywords.concat(keywordName)
                    }
                })
            }
        } else if (newServiceKeywords.length === 5) {
            if (newServiceKeywords.includes(keywordName)) {
                this.setState({
                    newService: {
                        ...this.state.newService,
                        keywords: newServiceKeywords.filter(keyword => keyword !== keywordName)
                    }
                })
            } else {
                this.onNotification('You only can have maximum of 5 search tags !', 'fail')
            }
        }
    }

    onMinPriceSelected = (event) => {
        this.setState({
            newService: {
                ...this.state.newService,
                basic: {
                    ...this.state.newService.basic,
                    min_price: event.target.value
                }
            }
        })
    }

    onLevelRequiredSelected = (event) => {
        this.setState({
            newService: {
                ...this.state.newService,
                basic: {
                    ...this.state.newService.basic,
                    require_level: event.target.textContent
                }
            }
        })
    }

    imagesOnUpload = event => {
        const noImages = this.state.newService.uploadedImages.length + event.target.files.length;
        if (noImages > 5) {
            this.onNotification(`Your service only can have maximum of 5 pictures ☹`, 'fail')
        } else {
            for (let file of event.target.files) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    this.setState({
                        newService: {
                            ...this.state.newService,
                            uploadedImages: this.state.newService.uploadedImages.concat({ imageUrl: reader.result, file: file })
                        }
                    })
                }
            }
        }
    }

    imageOnDelete = async (imgSrc) => {
        try {
            this.setState({
                newService: {
                    ...this.state.newService,
                    uploadedImages: this.state.newService.uploadedImages.filter(img =>
                        img.imageUrl !== imgSrc
                    )
                }
            })
        } catch (err) {
            console.log(err);
        }
    }

    onNewServiceUpload = async (event) => {
        try {
            event.preventDefault();
            if (this.state.newService.keywords.length === 0) {

                this.onNotification(`Your ${this.props.userRole === 'Seller' ? 'service' : 'job'} must have search tags ☹`, 'fail')
            } else if (this.state.newService.require_level === '') {

                this.onNotification('Your job must have search tags ☹', 'fail')
            } else if (this.state.newService.uploadedImages.length === 0) {

                this.onNotification('Your job must have at least one picture ☹', 'fail')
            }
            else {
                this.setState({
                    uploading: true
                })
                const userId = this.props.userId;
                const basicInfo = {
                    ...this.state.newService.basic,
                    description: (this.state.newService.basic.description),
                    skills_and_experiences: (this.state.newService.basic.skills_and_experiences),
                    love_working_here: (this.state.newService.basic.love_working_here),
                    why_best_choice: (this.state.newService.basic.why_best_choice)
                }

                const imageFiles = this.state.newService.uploadedImages.map(img => img.file);
                const imagesUploaded = [];
                for (let imageFile of imageFiles) {
                    const formData = new FormData();
                    formData.append('file', imageFile);
                    formData.append('upload_preset', 'Freelander_Service_Card');
                    const responseImageUploadedData = await axios.post(`https://api.Cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUDNAME}/image/upload`, formData)
                    imagesUploaded.push({ public_id: responseImageUploadedData.data.public_id, imageUrl: responseImageUploadedData.data.secure_url });
                }

                const newService = await axios.post(`/services/new`, {
                    basic: {
                        owner: userId,
                        type: this.props.userRole,
                        ...basicInfo
                    },
                    keywords: this.state.newService.keywords,
                    images: imagesUploaded
                })

                this.props.history.push(this.props.match.url + `/${this.state.newService.basic.service_id}`);
                this.props.onServiceDetailsHandle();
                this.setState({
                    newService: {
                        ...this.state.newService,
                        basic: {
                            ...this.state.newService.basic,
                            service_id: uuidv4().substring(0, 11)
                        }
                    },
                    uploading: false
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    onHidingServiceDetails = () => {
        this.props.onServiceDetailsHandle();
        this.props.history.goBack();
    }

    onNotification = (message, type) => {
        this.setState({
            notification: {
                state: true,
                message: message,
                type: type
            }
        })
        this.onNotificationToggle();
    }

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

    render() {

        const category = this.state.newService.basic.category;
        const job = this.state.newService.basic.job;
        const requirement = this.state.newService.basic.require_level;

        const categoryOptions = this.state.categories;

        const jobOptions = this.state.jobs;

        const categoryOnShowing = (
            <div className={styles['service-builder']}>
                <header className={styles['header--notice']}>
                    <h5>Remember that every field must be completed !</h5>
                </header>
                <div className={styles['service-builder__main']}>
                    <form onSubmit={(event) => this.onNewServiceUpload(event)}>
                        {/* TITLE */}
                        {/* INPUT GROUP */}
                        <div className={styles['service-builder__main__title']}>
                            <label className={styles['input-group__title']}><b>SERVICE TITLE</b></label>
                            <div className={styles['service-builder__main__title__input']}>
                                <Input
                                    customStyle='service-builder__title'
                                    elementType='textarea'
                                    elementConfig={{
                                        type: 'text',
                                        rows: '1',
                                        placeholder: 'Enter your title',
                                        required: true,
                                        maxLength: 80,
                                        minLength: 20
                                    }}
                                    value={this.state.newService.basic.title}
                                    changed={(event) => this.onInformationInput(event, 'title')}></Input>
                            </div>
                        </div>
                        {/* CATEGORY */}
                        <div className={styles['service-builder__category']}>
                            <label className={styles['input-group__title']} ><b>SERVICE CATEGORY</b></label>
                            <div className={styles['category-wrapper']}>
                                <Select
                                    options={categoryOptions}
                                    choice={category === '' ? 'Category' : category}
                                    onChoosing={this.onCategorySelected}
                                ></Select>
                                {this.state.jobs.length !== 0 && (
                                    <div className={styles['service-builder__job']}>
                                        <label><b>JOBS</b></label>
                                        <Select
                                            options={jobOptions}
                                            choice={job === '' ? 'Job' : job}
                                            onChoosing={this.onJobSelected}
                                        ></Select>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* KEYWORD */}
                        {this.state.keywords.length !== 0 && (
                            <div className={styles['service-builder__keywords']}>
                                <label className={styles['input-group__title']}><b>SEARCH TAGS</b></label>
                                <div className={styles['service-builder__keywords__list']}>
                                    {this.state.keywords.map((keyword, id) => {
                                        return <Keyword
                                            selected={this.state.newService.keywords.includes(keyword)}
                                            clicked={() => this.keywordSelected(keyword)}
                                            key={id}>{keyword}</Keyword>
                                    })}
                                </div>
                            </div>
                        )}
                        {/* DESCRIPTION */}
                        <div className={styles['service-builder__description']}>
                            <label className={styles['input-group__title']}><b>DESCRIPTION</b></label>
                            <Input
                                customStyle='service-builder__title'
                                elementType='textarea'
                                elementConfig={{
                                    type: 'text',
                                    rows: '10',
                                    placeholder: 'Describe your service',
                                    required: true,
                                    minLength: 100,
                                    maxLength: 1000
                                }}
                                value={this.state.newService.basic.description}
                                changed={event => this.onInformationInput(event, 'description')}></Input>
                        </div>
                        {/* DESCRIPTION */}
                        {this.props.userRole === 'Buyer' &&
                            <Fragment>
                                {/* WHY YOU WILL LOVE WORKING HERE */}
                                <div className={styles['service-builder__description']}>
                                    <label className={styles['input-group__title']}><b>WHY YOU WILL LOVE WORKING HERE</b></label>
                                    <Input
                                        customStyle='service-builder__title'
                                        elementType='textarea'
                                        elementConfig={{
                                            type: 'text',
                                            rows: '10',
                                            placeholder: 'Tell your freelancers why your company',
                                            required: true,
                                            minLength: 100,
                                            maxLength: 1000
                                        }}
                                        value={this.state.newService.basic.love_working_here}
                                        changed={event => this.onInformationInput(event, 'love_working_here')}></Input>
                                </div>
                                {/* YOUR SKILLS AND EXPERIENCE */}
                                <div className={styles['service-builder__description']}>
                                    <label className={styles['input-group__title']}><b>YOUR SKILLS AND EXPERIENCE</b></label>
                                    <Input
                                        customStyle='service-builder__title'
                                        elementType='textarea'
                                        elementConfig={{
                                            type: 'text',
                                            rows: '10',
                                            minLength: 100,
                                            maxLength: 1000,
                                            placeholder: 'Tell your freelancers your require standard',
                                            required: true
                                        }}
                                        value={this.state.newService.basic.skills_and_experiences}
                                        changed={event => this.onInformationInput(event, 'skills_and_experiences')}></Input>
                                </div>
                                {/* LEVEL REQUIRED */}
                                <div className={styles['service-builder__level']}>
                                    <label className={styles['input-group__title']}><b>LEVEL REQUIRED</b></label>
                                    <Select options={['No requirement', 'Beginner', 'Intermediate', 'Expert']}
                                        choice={requirement !== '' ? requirement : 'Requirement'}
                                        onChoosing={this.onLevelRequiredSelected}
                                    ></Select>
                                </div>
                            </Fragment>
                        }
                        {/* WHY YOU ARE THE BEST CHOICE */}
                        {this.props.userRole === 'Seller' &&
                            <div className={styles['service-builder__description']}>
                                <label className={styles['input-group__title']}><b>WHY YOU ARE THE BEST CHOICE</b></label>
                                <Input
                                    customStyle='service-builder__title'
                                    elementType='textarea'
                                    elementConfig={{
                                        type: 'text',
                                        rows: '10',
                                        placeholder: 'Convince your buyers that you will provide the best service for them',
                                        required: true,
                                        minLength: 100,
                                        maxLength: 1000
                                    }}
                                    value={this.state.newService.basic.why_best_choice}
                                    changed={event => this.onInformationInput(event, 'why_best_choice')}></Input>
                            </div>
                        }
                        {/* PRICE */}
                        <div className={styles['service-builder__price']}>
                            <label className={styles['input-group__title']}><b>{this.props.userRole === 'Seller' ? 'MIN PRICE' : 'MIN SALARY PER MONTH'}</b></label>
                            <RangeSlider
                                customStyle='price'
                                min='0'
                                max={this.props.userRole === 'Seller' ? '100' : '2000'}
                                value={this.state.newService.basic.min_price}
                                changed={this.onMinPriceSelected}></RangeSlider>
                        </div>
                        {/* IMAGES */}
                        <div className={styles['service-builder__image-upload']}>
                            <label className={styles['input-group__title']}><b>UPLOAD IMAGES</b></label>
                            <ImageUploader
                                images={this.state.newService.uploadedImages}
                                imagesOnUpload={this.imagesOnUpload}
                                imageOnDelete={this.imageOnDelete}
                            ></ImageUploader>
                            {/* <div className={styles['service-builder__image-upload__uploaded']}>
                                        <Gallery
                                            deleteAble='true'
                                            customStyle={this.state.newService.uploadedImages.length === 0 ? '' : 'service-builder'}
                                            imagesToShow={1}
                                            images={this.state.newService.uploadedImages}
                                            onDeleteImg={this.imageOnDelete}></Gallery>
                                        <span className={styles['image-uploader']} onClick={() => this.showWidget(widget)}>Upload</span>
                                    </div> */}
                        </div>
                        <div className={styles['submit']}>
                            <div></div>
                            <div style={{ width: '82%' }}>
                                <Input
                                    customStyle='service-builder__submit'
                                    elementType='submit'
                                    elementConfig={{
                                        value: 'Upload your service :D'
                                    }}
                                ></Input>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        );

        const isUploading = this.state.uploading;
        const onSD = this.props.onServiceDetails;

        return (
            <Fragment>
                { isUploading && <Loading>Uploading ... 😃</Loading>}
                <div className={styles[isUploading || onSD ? 'blur' : '']}>
                    <section className={styles['navbar']}>
                        <Navbar
                            active='Service Builder'
                            onUserRoleSwitch={this.props.onUserRoleSwitch}
                            notifications={this.state.userNotifications}></Navbar>
                    </section>
                    <section className={styles['content']}>
                        {isUploading ? <Loading>Please wait a little bit 😀</Loading> : (
                            <Fragment>
                                <Intro customStyle='intro-builder'
                                    header={`Create your best ${this.props.userRole === 'Seller' ? 'job' : 'service'} to grow your business 😃`}></Intro>
                                <div className={styles['content__category-content']}>
                                    {categoryOnShowing}
                                </div>
                            </Fragment>
                        )}
                    </section>
                    {this.state.notification.state && <section className={styles['notification']}>
                        <Notification type={this.state.notification.type}>{this.state.notification.message}</Notification>
                    </section>}
                    <section className={styles['service-details']}>
                        <Route path={this.props.match.url + '/:id'} render={() => <ServiceDetails close={this.onHidingServiceDetails}></ServiceDetails>}></Route>
                    </section>

                </div >
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
        onServiceDetailsHandle: () => dispatch(actions.onServiceDetails()),
        onUserRoleSwitch: () => dispatch(actions.onUserRoleSwitch())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceBuilder);
