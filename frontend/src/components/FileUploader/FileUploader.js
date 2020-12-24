import React from 'react';
import * as styles from './FileUploader.module.css';
import Button from '../UI/Button/Button';

const FileUploader = props => {
    return (
        <div className={styles["file-upload"]}>
            <Button className={styles["file-upload-btn"]} type="button" onclick="$('.file-upload-input').trigger( 'click' )">Add Image</Button>

            <div className={styles["image-upload-wrap"]}>
                <input className={styles["file-upload-input"]} type='file' onchange="readURL(this);" accept="image/*" />
                <div className={styles["drag-text"]}>
                    <h3>Drag and drop a file or select add Image</h3>
                </div>
            </div>
            <div className={styles["file-upload-content"]}>
                <img className={styles["file-upload-image"]} src="#" alt="your image" />
                <div className={styles["image-title-wrap"]}>
                    <Button type="button" onclick="removeUpload()" className={styles["remove-image"]}>Remove <span className={styles["image-title"]}>Uploaded Image</span></Button>
                </div>
            </div>
        </div>
    )
}

export default FileUploader;