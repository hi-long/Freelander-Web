const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

router.get('/searches', async (req, res, next) => {
    try {
        const keyword = req.query['keyword'];
        const userId = req.query['user-id'];
        const userRole = req.query['user-role'];
        const rating = req.query['rating'];
        const minPrice = req.query['min-price'];
        const maxPrice = req.query['max-price'];
        const page = +req.query['page'];

        let userSavedList = [];
        if (userId) {
            const userSaveListQuery = `select service_id from usersavedlist where user_id = '${userId}'`;
            userSavedList = await db.query(userSaveListQuery);
        }

        const servicesIdQuery = `
        select service_id
        from servicekeywords
        join service using (service_id)
        where keyword like '%${keyword}%' and owner != '${userId}'`;

        const serviceIdData = await db.query(servicesIdQuery);

        if (serviceIdData.length !== 0) {
            const servicesNotSaved = [];
            for (let service of serviceIdData) {
                let isSaved = false;
                for (let savedService of userSavedList) {
                    if (service.service_id === savedService.service_id) {
                        isSaved = true;
                        break;
                    }
                }
                if (isSaved === false) {
                    servicesNotSaved.push(service.service_id);
                }
            }

            const priceQuery = minPrice ? `and min_price between ${minPrice} and ${maxPrice}` : '';
            const ratingQuery = rating ? `order by rating ${rating ? 'desc' : 'asc'}` : '';
            const userRoleQuery = userRole !== 'null' ? `and type = '${userRole === 'Seller' ? 'Buyer' : 'Seller'}'` : '';
            const numberOfServices = await db.query(`
                select count(*) as noServices
                from service
                where service_id in (?) 
                    ${userRoleQuery}
                    ${priceQuery} 
                    ${ratingQuery}
                    `, [servicesNotSaved])

            const serviceResultQuery = `
                    select owner, service_id, type, title, min_price, rating, no_reviews
                    from service
                    where service_id in (?)
                        ${userRoleQuery}
                        ${priceQuery} 
                        ${ratingQuery}
                        limit ${9 * page}, 9
                        `;
            const servicesResultData = await db.query(serviceResultQuery, [servicesNotSaved]);
            for (let service of servicesResultData) {
                const ownerQuery = `select cover, name, user_id from users where user_id = '${service.owner}'`;
                const serviceImagesQuery = `select imageUrl, public_id from serviceimages where service_id = '${service.service_id}'`;

                const serviceImagesData = await db.query(serviceImagesQuery);

                const ownerData = await db.query(ownerQuery);
                service.owner = ownerData[0];
                service.images = serviceImagesData;
                service.saved = false;
            }
            res.json({
                message: 'success',
                results: servicesResultData,
                noPages: Math.ceil(numberOfServices[0].noServices / 9)
            });
        }
        else {
            res.json({
                message: 'No data'
            })
        }
    } catch (err) {
        console.log(err)
        res.json(err)
    }
})

module.exports = router;
