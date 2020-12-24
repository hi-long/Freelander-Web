const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

require('dotenv').config();

// ---------- SERVICE ---------- //
router.post('/services/new', async (req, res, next) => {
    try {

        const { basic, keywords, images } = req.body;
        const serviceId = basic.service_id;
        const newServiceData = basic;
        const newServiceQuery = `insert into service set ?`;
        const newService = await db.query(newServiceQuery, newServiceData);

        const newServiceImagesData = images.map(image => [serviceId, image.imageUrl, image.public_id]);

        const newServiceImagesQuery = `insert into serviceimages (service_id, imageUrl, public_id) values ?`;
        const newServiceImages = await db.query(newServiceImagesQuery, [newServiceImagesData])


        const newServiceKeywordsData = keywords.map(keyword => [serviceId, keyword]);
        newServiceKeywordsData.push([serviceId, basic.job]);
        newServiceKeywordsData.push([serviceId, basic.category]);

        const newKeywordsQuery = `insert into servicekeywords(service_id, keyword) values ?`;
        const newKeywords = await db.query(newKeywordsQuery, [newServiceKeywordsData]);

        res.json({
            ...newService,
            ...newServiceImages,
            serviceId: newService.insertId,
            ...newKeywords
        })
    } catch (err) {
        res.json(err);
    }
})

router.put('/services/:id/edit', async (req, res, next) => {
    try {
        const serviceId = req.params.id;
        const { service, images, keywords } = req.body;

        const serviceQuery = `update service set ? where service_id = '${serviceId}'`;
        const serviceData = await db.query(serviceQuery, service);

        const deleteImagesQuery = `delete from serviceimages where service_id = '${serviceId}'`;
        const deleteImagesData = await db.query(deleteImagesQuery);

        const newServiceImagesData = images.map(image => [serviceId, image.imageUrl, image.public_id]);

        const newServiceImagesQuery = `insert into serviceimages (service_id, imageUrl, public_id) values ?`;
        const newServiceImages = await db.query(newServiceImagesQuery, [newServiceImagesData]);

        const deleteKeywordsQuery = `delete from servicekeywords where service_id = '${serviceId}'`;
        const deleteKeywordsData = await db.query(deleteKeywordsQuery);

        const newServiceKeywordsData = [];

        for (let keyword of keywords) {
            newServiceKeywordsData.push([serviceId, keyword.name]);
        }
        const keywordsQuery = `insert into servicekeywords (service_id, keyword) values ?`;
        const keywordsData = await db.query(keywordsQuery, [newServiceKeywordsData]);

        res.json({
            service: serviceData
        })
    } catch (err) {
        res.json(err);
    }
})

router.get('/services/:id', async (req, res, next) => {
    try {

        const serviceId = req.params.id;
        const serviceDataQuery = `select * from service where service_id = '${serviceId}'`;
        const serviceData = await db.query(serviceDataQuery);

        const serviceOwnerQuery = `select cover, name, description from users where user_id = '${serviceData[0].owner}'`;
        const serviceOwnerData = await db.query(serviceOwnerQuery);

        const serviceImagesQuery = `select imageUrl, public_id from serviceimages where service_id = '${serviceId}'`;
        const serviceImagesData = await db.query(serviceImagesQuery);

        const serviceReviewsQuery = `select review.*, users.name, users.cover, users.user_id from review join users using (user_id) where service_id = '${serviceId}' order by date desc`;
        const serviceReviewsData = await db.query(serviceReviewsQuery);

        const relatedServicesQuery = `select service_id, title from service where owner = '${serviceData[0].owner}'`;
        const relatedServicesData = await db.query(relatedServicesQuery);

        const serviceKeywordsQuery = `select keyword from servicekeywords where service_id = '${serviceId}'`;
        const serviceKeywordsData = await db.query(serviceKeywordsQuery);

        res.json({
            service: serviceData,
            images: serviceImagesData,
            owner: serviceOwnerData,
            keywords: serviceKeywordsData,
            reviews: serviceReviewsData,
            relatedServices: relatedServicesData
        })
    } catch (err) {
        res.json(err);
    }
})

router.delete('/services/:service_id', async (req, res, next) => {
    try {
        const service_id = req.params.service_id;
        const deleteService = await db.query(`delete from service where service_id = "${service_id}"`);
        res.json({
            status: 'Success',
            message: 'The service is successfully deleted :D'
        })
    } catch (err) {
        console.log(err);
        res.json({
            status: 'Fail',
            message: 'Unexpected error happens, please try later :( '
        })
    }
})

module.exports = router;
