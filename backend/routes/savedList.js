const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

router.post('/:id/saved-list/new', async (req, res, next) => {
    try {
        const savedListAdditionQuery = `insert into usersavedlist set ?`;
        const savedListAdditionData = await db.query(savedListAdditionQuery, { user_id: req.params.id, service_id: req.body.serviceId });
        res.json({
            status: 'success',
            message: 'The service is successfully added to your save list 😄'
        })
    } catch (err) {
        res.json(err);
    }
})

router.get('/:id/saved-list', async (req, res, next) => {
    try {
        const id = req.params.id;
        const savedListQuery = `select * from usersavedlist where user_id = '${id}'`;
        const savedListData = await db.query(savedListQuery);

        const servicesData = [];
        for (let service of savedListData) {
            const serviceQuery = `select owner, service_id, type, title, min_price, rating, no_reviews from service where service_id = '${service.service_id}'`;
            const serviceData = await db.query(serviceQuery);

            const ownerQuery = `select cover, name, user_id from users where user_id = '${serviceData[0].owner}'`;
            const serviceImagesQuery = `select imageUrl from serviceimages where service_id = '${service.service_id}'`;

            const serviceImagesData = await db.query(serviceImagesQuery);
            const ownerData = await db.query(ownerQuery);
            serviceData[0].owner = ownerData[0];
            serviceData[0].images = serviceImagesData;

            serviceData[0].saved = true;
            servicesData.push(serviceData[0]);
        }
        res.json(servicesData);
    } catch (err) {
        console.log(err);
    }
})



router.delete('/:id/saved-list/:service_id', async (req, res, next) => {
    try {
        const { id, service_id } = req.params;

        const serviceDeleteQuery = `delete from usersavedlist where user_id = '${id}' and service_id = '${service_id}'`;
        const serviceDeleteData = await db.query(serviceDeleteQuery);

        res.json({
            status: 'success',
            message: 'The service is deleted 🙁'
        })
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: 'Something wrong, please try later 😔'
        })
    }
})

module.exports = router;