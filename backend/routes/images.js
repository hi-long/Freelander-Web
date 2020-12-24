const { restart } = require('nodemon');

const express = require('express'),
    cloudinary = require('cloudinary'),
    router = express.Router();

require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUDNAME,
    api_key: process.env.REACT_APP_CLOUDINARY_APIKEY,
    api_secret: process.env.REACT_APP_API_SECRET
});

router.post('/image/destroy', async (req, res) => {
    try {
        const deleteImage = cloudinary.v2.uploader.destroy(req.body.imagePublicId);
        res.json({
            message: deleteImage.result
        })
    } catch (err) {
        res.status(500).json({
            message: 'Try again'
        })
    }
})

module.exports = router;