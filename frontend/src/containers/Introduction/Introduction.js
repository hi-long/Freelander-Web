import React, { Component, Fragment } from 'react';

import Category from '../../components/Category/Category';
import Keyword from '../../components/Keyword/Keyword';
import Navbar from '../../components/Navbar/Navbar';
import SearchTab from '../../components/SearchTab/SearchTab';
import * as styles from './Introduction.module.css';
import Button from '../../components/UI/Button/Button';
import { connect } from 'react-redux';
import * as actions from '../store/actions/index.js';
import SuggestionBox from '../../components/SuggestionBox/SuggestionBox';
import axios from '../../axios-baseURL';
import IntroductionCard from '../../components/Card/IntroductionCard/IntroductionCard';
import Authentication from '../Authentication/Authentication';

const keywords = ['Web', 'React', 'Angular'];
const popularServices = [
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/055f758c1f5b3a1ab38c047dce553860-1598561741678/logo-design-2x.png', description: 'Create your best website', name: 'Web dev' },
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/ae11e2d45410b0eded7fba0e46b09dbd-1598561917003/wordpress-2x.png', description: 'Analyze your app data', name: 'Data' },
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/055f758c1f5b3a1ab38c047dce553860-1598561741668/seo-2x.png', description: 'Test your applications', name: 'Testing' },
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/055f758c1f5b3a1ab38c047dce553860-1598561741664/illustration-2x.png', description: 'High quality mobile app', name: 'Mobile' },
    { image: 'https://images.unsplash.com/photo-1558742569-fe6d39d05837?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80', description: 'Create awesome games', name: 'Game dev' },
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/055f758c1f5b3a1ab38c047dce553860-1598561741668/seo-2x.png', description: 'Find your best project manager', name: 'Manager' },
    { image: 'https://images.unsplash.com/photo-1514580426463-fd77dc4d0672?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8d2ViJTIwZGVzaWdufGVufDB8MXwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', description: 'Get your best designs', name: 'Design' },
    { image: 'https://images.unsplash.com/photo-1586245510994-1ba3fb3a5ef2?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OXx8d2ViJTIwZGVzaWdufGVufDB8MXwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', description: 'Protect your application', name: 'Security' },
    { image: 'https://images.unsplash.com/photo-1561233835-f937539b95b9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8bmV0d29ya3xlbnwwfDF8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60', description: 'Have your best network structure', name: 'Network' },
    { image: 'https://fiverr-res.cloudinary.com/q_auto,f_auto,w_255,dpr_2.0/v1/attachments/generic_asset/asset/055f758c1f5b3a1ab38c047dce553860-1598561741664/data-entry-2x.png', description: 'There are lots of other to explore', name: 'Others' }
]

const categories = ['Web', 'Data', 'Design', 'Game', 'Manager', 'Mobile', 'Network', 'Security', 'Testing', 'Others']

class Introduction extends Component {

    state = {
        searchingKeyword: '',
        suggestions: [],
        ENDPOINT: `localhost:5000`
    }

    componentDidUpdate() {
        if (this.props.userId) {
            this.props.history.replace(`/${this.props.userId}`)
        }
    }

    onAuthButtonClicked = () => {
        this.props.authCompToggle(!this.props.authCompShowing);
    }

    onSearching = async (event) => {
        try {
            this.props.onSearching(true);
            const input = event.target.value;
            if (input !== '') {
                const responseSuggestionsData = await axios.get(`/suggestion/${input}`);
                const suggestions = responseSuggestionsData.data.map(suggestion => suggestion.keyword);
                this.setState({
                    searchingKeyword: input,
                    suggestions: suggestions.sort((a, b) => a.length - b.length)
                })
            } else {
                this.setState({
                    searchingKeyword: input
                })
            }
        } catch (err) {
            console.log(err);
        }
    }

    render() {
        const auth = this.props.authCompShowing ? <Authentication></Authentication> : null;

        return (
            <Fragment>
                {auth}
                <div className={this.props.authCompShowing ? styles['fade'] : ''}>
                    <div className={styles['introduction']}>
                        <Navbar
                            onAuthInit={this.onAuthButtonClicked}></Navbar>
                        {/* INTRODUCTION HEADER */}
                        <div className={styles['introduction__header']}>
                            <p style={{ padding: "0", margin: "0.75rem 0", fontSize: "2rem", fontWeight: '500' }}>Find the perfect <i style={{ fontSize: '2.5rem', fontFamily: 'auto' }}>freelance</i> services for your business</p>
                            <SearchTab directable='true' customStyle='introduction__header' value={this.state.searchingKeyword} onSearching={(event) => this.onSearching(event)}></SearchTab>
                            {(this.props.onSearchBoxShowing && this.state.searchingKeyword !== '') &&
                                <SuggestionBox customStyle='search-tab--introduction' directable={true} keywords={this.state.suggestions}></SuggestionBox>}
                            <div className={styles['introduction__header__keywords']}>
                                <p>Popular:</p>
                                {keywords.map(keyword => {
                                    return <Keyword directable={true} key={keyword}>{keyword}</Keyword>
                                })}
                            </div>
                        </div>
                    </div>
                    {/* POPULAR SERVICES */}
                    <div
                        className={styles['popular-services']}
                        data-aos="fade-right"
                        data-aos-offset="300"
                        data-aos-easing="ease-in-sine">
                        <h2>Popular services</h2>
                        <Category
                            customStyle='intro__popular-services'
                            to='/'
                            title='On demanding services in Web development'
                            numOfSlides='5'
                            numOfScroll='5'>
                            {popularServices.map((service, id) => {
                                return (
                                    <IntroductionCard
                                        key={service.name}
                                        {...service}></IntroductionCard>
                                )
                            })}
                        </Category>
                    </div>
                    {/* ALL SERVICES */}
                    <div className={styles['all-services']}>
                        <h2>Explore the market</h2>
                        <div className={styles['all-services__list']}>
                            {categories.map(category => {
                                return (
                                    <div key={category} className={styles['all-services__item']}>
                                        <img alt='' src={process.env.PUBLIC_URL + `/images/introduction/${category}.png`}></img>
                                        <hr></hr>
                                        <span>{category}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    <div className={styles['invitation']}>
                        <div className={styles['invitation--centered']}>
                            <h2>Find <i>talents</i> needed to get your business <i>growing</i>.</h2>
                            <Button
                                customStyle='invitation'
                                clicked={this.onAuthButtonClicked}>Get started !</Button>
                        </div>
                    </div>
                </div>
            </Fragment >
        )
    }
}

const mapStateToProps = state => {
    return {
        userId: state.authReducer.userId,
        authCompShowing: state.authReducer.authCompToggle,
        onSearchBoxShowing: state.otherReducer.onSearching
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onSearching: (value) => dispatch(actions.onSearching(value)),
        authCompToggle: (onAuth) => dispatch(actions.authCompToggle(onAuth))
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Introduction);