const express = require('express'),
    router = express.Router(),
    db = require('../database')
// db = require('../config/pg');

router.get('/:id/recently-view', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const recentlyViewListIdsQuery = `select service_id from userrecentlyview where user_id = '${userId}'`;
        const recentlyViewListIdsData = await db.query(recentlyViewListIdsQuery);
        const recentlyViewListIds = recentlyViewListIdsData.map(service => service.service_id);
        const recentViewList = [];
        for (let serviceId of recentlyViewListIds) {
            const serviceQuery = `select owner, service_id, type, title, min_price, rating, no_reviews from service where service_id = '${serviceId}'`;
            const serviceData = await db.query(serviceQuery);

            const serviceImagesQuery = `select imageUrl from serviceimages where service_id = '${serviceId}'`;
            const serviceImagesData = await db.query(serviceImagesQuery);
            serviceData[0].images = serviceImagesData;

            const ownerQuery = `select cover, name, user_id from users where user_id = '${serviceData[0].owner}'`;
            const ownerData = await db.query(ownerQuery);
            serviceData[0].owner = ownerData[0];

            serviceData[0].saved = false;
            recentViewList.push(serviceData[0]);
        }
        if (recentViewList.length === 0) {
            res.json('Empty')
        } else {
            res.json(recentViewList)
        }
    } catch (err) {
        res.json(err);
    }
})

router.post('/:id/recently-view/new', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const serviceId = req.body.serviceId;

        const recentlyViewListLengthQuery = `select count(*) as length from userrecentlyview where user_id = '${userId}'`;
        const recentlyViewListLength = await db.query(recentlyViewListLengthQuery);

        if (recentlyViewListLength.length == 10) {
            const deleteFirstRecord = await db.query(`delete from userrecentlyview limit 1`);
        }

        const addServiceQuery = `insert into userrecentlyview set ?`;
        const addServiceData = await db.query(addServiceQuery, { user_id: userId, service_id: serviceId })
        console.log(addServiceData)
    } catch (err) {
        res.json(err)
    }
})


module.exports = router;