import React from 'react';
import Slider from 'react-slick';
import SliderArrow from '../SliderArrow/SliderArrow';
import * as styles from './Gallery.module.css';
import GalleryItem from './GalleryItem/GalleryItem';

const sliderProps = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    nextArrow: <SliderArrow type='next' customStyle='gallery-arrow'></SliderArrow>,
    prevArrow: <SliderArrow type='prev' customStyle='gallery-arrow'></SliderArrow>
}

export const sliderArrowSettings = {

};

const Gallery = props => {
    return (
        <Slider
            className={[styles['gallery'], styles[props.customStyle]].join(' ')}
            {...sliderProps}
            slidesToShow={props.imagesToShow}>
            {props.images.map((image, id) => (
                <GalleryItem key={id} imgSrc={image.imageUrl} deleteAble={props.deleteAble} clicked={props.imageOnDelete} ></GalleryItem>
            ))}
        </Slider>
    )
}

export default Gallery;;

