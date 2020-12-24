import React from 'react';
import Input from '../UI/Input/Input';
import Gallery from '../Gallery/Gallery';
import * as styles from './ImageUploader.module.css';

const ImageUploader = props => {
    return (
        <div className={styles['image-uploader']}>
            {props.images.length !== 0 && (
                // <Gallery imagesToShow={props.images}></Gallery>
                <Gallery
                    deleteAble='true'
                    customStyle={props.images.length === 0 ? '' : 'service-builder'}
                    imagesToShow={1}
                    images={props.images}
                    imageOnDelete={props.imageOnDelete}></Gallery>
            )}
            <div className={[styles['uploader'], styles[props.images.length !== 0 ? 'minimize' : '']].join(' ')}>
                <Input
                    customStyle='image-uploader'
                    elementType='file'
                    elementConfig={{
                        accept: "image/png, image/jpeg",
                        required: true,
                        multiple: true,
                        id: 'images'
                    }}
                    changed={props.imagesOnUpload}></Input>
                <label htmlFor='images'>
                    <img alt='' src={process.env.PUBLIC_URL + '/images/ImageUploader/upload.png'}></img>
                    <h3> Upload your service images here :D</h3>
                </label>
            </div>

        </div>
    )
}

export default ImageUploader;