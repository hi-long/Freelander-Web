import React from 'react';
import Slider from 'react-slick';
import * as styles from './Intro.module.css';

const Intro = props => {
    const sliderConfig = {
        dots: false,
        prevArrow: false,
        nextArrow: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        speed: 2000,
        autoplaySpeed: 5000
    }

    const introPics = [
        'https://images.unsplash.com/photo-1494132494824-52f8bb6ed376?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
        'https://images.unsplash.com/photo-1457131760772-7017c6180f05?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1036&q=80',
        'https://images.unsplash.com/photo-1498568715259-5c1dc96aa8e7?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
    ]

    return (
        <div className={[styles[['intro']], styles[[props.customStyle]]].join(' ')}>
            <header className={styles['intro-header']}>
                <h2>{props.header}</h2>
            </header>
            <Slider {...sliderConfig}>
                {introPics.map(img => {
                    return <img alt='' src={img}></img>
                })}
            </Slider>
        </div>
    )
}

export default Intro;
