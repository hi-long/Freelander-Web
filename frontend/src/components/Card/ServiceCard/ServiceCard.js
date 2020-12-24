import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../../Gallery/Gallery';
import * as styles from './ServiceCard.module.css';

const ServiceCard = props => {
    return (
        <div className={[styles['card'], styles[props.customStyle]].join(' ')}>
            <div className={styles[`card__image`]}>
                <Gallery customStyle={props.customGalleryStyle} imagesToShow={props.imagesToShow} images={props.images}></Gallery>
            </div>
            <div className={styles[`card__information`]}>
                <div className={styles[`card__information__owner`]}>
                    <img
                        alt='...'
                        className={styles[`card__information__owner__avatar`]}
                        src={props.cover}></img>
                    <Link to={props.owner}>
                        <span className={styles[`card__information__owner__name`]}>{props.name}</span>
                    </Link>
                </div>
                <div className={styles[`card__information__description`]}>
                    <span onClick={props.clicked}>{props.description}</span>
                </div>
                <div className={styles[`card__information__rating`]}>
                    <img alt="..." src={process.env.PUBLIC_URL + '/images/ServicesBrowse/star.png'} />
                    <span style={{ color: 'gold', fontWeight: 'bold' }}>{props.rating}</span>
                    <span> ({props.no_reviews})</span>
                </div>
                <hr style={{ width: '100%', color: '#80808040', margin: '0' }}></hr>
                <div className={styles[`card__information__price`]}>
                    {props.savable && <span><img
                        style={{ cursor: 'pointer' }}
                        alt=''
                        src={process.env.PUBLIC_URL + `/images/ServicesBrowse/${props.saved ? 'saved' : 'save'}.png`}
                        onClick={props.savedList} /></span>}
                    <span>{props.min_price ? `STARTING AT $${props.min_price}` : null}</span>
                </div>
                <div
                    className={styles['type']}
                    data-type={props.type === 'Seller' ? 'Service' : 'Job'}
                >
                    <img
                        alt=''
                        src={process.env.PUBLIC_URL + `/images/Service/${props.type}.png`}></img>
                </div>
            </div>
        </div >
    )
}

export default ServiceCard;