import React from 'react';
import Slider from 'react-slick';
import SliderArrow from '../SliderArrow/SliderArrow';
import * as styles from './Category.module.css';

const Category = props => {
    const sliderProps = {
        dots: true,
        infinite: true,
        slidesToShow: +props.numOfSlides,
        slidesToScroll: +props.numOfScroll,
        speed: 500,
        nextArrow: <SliderArrow type='next'></SliderArrow>,
        prevArrow: <SliderArrow type='prev'></SliderArrow>,
        className: 'category__slider'
    }

    const header = (
        <header className={styles['category__header']}>
            <h2 className={styles['category__header__title']}>{props.title}</h2>
        </header>
    )

    return (
        <section className={[styles['category'], styles[props.customStyle]].join('')}>
            {props.header ? header : null}
            <Slider {...sliderProps}>
                {props.children}
            </Slider>
        </section>
    )
}

export default Category;
