import React from 'react';
import DeleteButton from '../../DeleteButton/DeleteButton';
import * as styles from './GalleryItem.module.css';

const GalleryItem = props => {
    const deleteIcon = props.deleteAble && (
        <DeleteButton clicked={props.clicked} imageUrl={props.imgSrc}></DeleteButton>
    )

    return (
        <div className={[styles['gallery-item'], styles[props.customStyle]].join(' ')}>
            <img className={styles['item__img']} alt='' src={props.imgSrc}></img>
            {deleteIcon}
        </div>
    )
}

export default GalleryItem;
