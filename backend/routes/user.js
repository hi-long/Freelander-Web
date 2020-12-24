const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');
router.get('/:id/services', async (req, res, next) => {
    try {
        const id = req.params.id;
        const servicesIdQuery = `select * from service where owner = '${id}'`;
        const servicesIdData = await db.query(servicesIdQuery);

        const servicesData = [], jobsData = [];
        for (let service of servicesIdData) {
            const serviceQuery = `select owner, service_id, type, title, min_price, rating, no_reviews from service where service_id = '${service.service_id}'`;
            const serviceData = await db.query(serviceQuery);

            const ownerQuery = `select cover, name, user_id from users where user_id = '${serviceData[0].owner}'`;
            const serviceImagesQuery = `select imageUrl from serviceimages where service_id = '${service.service_id}'`;

            const serviceImagesData = await db.query(serviceImagesQuery);
            const ownerData = await db.query(ownerQuery);
            serviceData[0].owner = ownerData[0];
            serviceData[0].images = serviceImagesData;

            serviceData[0].saved = true;

            if (serviceData[0].type === 'Seller') {
                servicesData.push(serviceData[0]);
            } else {
                jobsData.push(serviceData[0]);
            }
        }
        res.json({
            servicesData,
            jobsData
        });
    } catch (err) {
        console.log(err);
    }
})

router.get('/:id/:field', async (req, res, next) => {
    try {
        const skillsQuery = ``;
        const { id, field } = req.params;
        let data = null;
        switch (field) {
            case 'profile':
                let basicFieldQuery = `select * from users where user_id = '${id}'`;
                let basicFieldData = await db.query(basicFieldQuery);

                let linkedAccountQuery = `select linked_id, link from users join userlinkedaccount using(user_id) where user_id = '${id}'`;
                let linkedAccountData = await db.query(linkedAccountQuery);

                let userSkillsData = await db.query(`
                    select keyword
                    from userskills 
                    where user_id = '${id}'
                `)

                let servicesQuery = `select * from service where owner = '${id}'`;
                let servicesData = await db.query(servicesQuery);

                for (let service of servicesData) {
                    let serviceImagesQuery = `select * from serviceimages where service_id = '${service.service_id}'`;
                    let serviceImages = await db.query(serviceImagesQuery);
                    service.images = serviceImages;
                }

                let services = [], jobs = [];
                for (let service of servicesData) {
                    const reviewQuery = `select * from review where service_id = '${service.service_id}'`;
                    const reviewData = await db.query(reviewQuery);
                    for (let review of reviewData) {
                        const reviewOwnerQuery = `select name, cover, rating from users where user_id = '${review.user_id}'`;
                        const reviewOwnerData = await db.query(reviewOwnerQuery);
                        review.user = reviewOwnerData[0];
                    }
                    if (service.type === 'Seller') {
                        services = services.concat(reviewData);
                    } else {
                        jobs = jobs.concat(reviewData);
                    }
                }

                data = {
                    basic: basicFieldData,
                    linkedAccount: linkedAccountData,
                    services: servicesData,
                    skills: userSkillsData,
                    reviews: {
                        services: services,
                        jobs: jobs
                    }
                }

                break;
            case 'basic':
                data = await db.query(`select user_id, cover, name, description, rating, noServices from users where user_id = '${id}'`);
                break;
            case 'linkedAccount':
                linkedAccountQuery = `select linked_id, link from users join userlinkedaccount using(user_id) where user_id = '${id}'`;
                data = await db.query(linkedAccountQuery);
                break;
        }
        res.json(data);
    } catch (err) {
        res.json(err);
    }
})

router.post('/:id/new', async (req, res, next) => {
    try {
        const newUser = {
            user_id: req.params.id,
            cover: req.body.cover,
            name: req.body.name,
            description: ''
        }
        const query = 'insert into users set ?';
        const Data = db.query(query, newUser)
        res.json(Data);
    } catch (err) {
        res.json(err);
    }
})

router.put('/:id/edit', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { userData, skills, linkedAccounts } = req.body;
        console.log(userData)
        const basicDataQuery = `update users set ? where user_id = '${id}'`;
        const basicData = await db.query(basicDataQuery, userData);
        console.log(basicData)

        const skillsDataDeleteQuery = `delete from userskills where user_id = '${id}'`;
        const skillsDataDelete = await db.query(skillsDataDeleteQuery);

        const skillsDataQuery = `insert into userskills(user_id, keyword) values ?`;
        const skillsData = await db.query(skillsDataQuery, [skills]);

        const linkedAccountDataDeleteQuery = `delete from userlinkedaccount where user_id = '${id}'`;
        const linkedAccountDataDelete = await db.query(linkedAccountDataDeleteQuery);

        const linkedAccountDataQuery = `insert into userlinkedaccount(user_id, linked_id, link) values ? `;
        const linkedAccountData = await db.query(linkedAccountDataQuery, [linkedAccounts]);
        res.json(basicData)
    } catch (err) {
        console.log(err);
        res.json(err);
    }
})

module.exports = router;