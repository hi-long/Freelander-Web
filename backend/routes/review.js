const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

router.get('/services/:id/reviews', async (req, res, next) => {
    try {
        const id = req.params.id;
        const reviewsQuery = `
        select * 
        from review
        join users using (user_id)
        where service_id = '${id}'`;
        const reviews = await db.query(reviewsQuery);
        res.json(reviews);
    } catch (err) {
        res.json(err);
    }
})

router.put('/reviews/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const editedReview = req.body.editedReview;
        const editedReviewData = await db.query(
            `update review
            set content = '${editedReview.content}'
            where review_id = '${id}'`
        )
        res.json({
            status: 'success',
            message: 'Your review is successfully edited :D'
        })
    } catch (err) {
        console.log(err);
        res.json({
            status: 'fail',
            message: 'Some problem happens, please try later :C',
            err: err
        })
    }
})

router.delete('/reviews/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const delReviewRating = await db.query(`
            select r.rating as r_rating, r.service_id as service_id, no_reviews, service.rating as s_rating 
            from review as r
            join service using (service_id)
            where review_id = '${id}'
        `)
        const { r_rating, service_id, no_reviews, s_rating } = delReviewRating[0];
        const updatedServiceRating = (no_reviews * s_rating - r_rating) / (no_reviews + 1);
        const updatedServiceRatingData = await db.query(`
            update service
            set no_reviews = ${no_reviews - 1},
                rating = ${updatedServiceRating}
            where service_id = '${service_id}'
        `)
        const deletedReviewData = await db.query(
            `delete from review
            where review_id = '${id}'`
        )
        res.json({
            status: 'success',
            message: 'Your comment is successfully deleted :D'
        })
    } catch (err) {
        res.json({
            status: 'fail',
            message: 'Some problem happens, please try later :C',
            err: err
        })
    }
})

router.post('/services/:id/reviews/new', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { newReviewData, serviceOwner } = req.body;

        const newReviewQuery = `insert into review set ?`
        const newReview = await db.query(newReviewQuery, newReviewData);

        const serviceNoReviewsQuery = `select no_reviews, rating from service where service_id = '${id}'`;
        const serviceNoReviewData = await db.query(serviceNoReviewsQuery);

        const oldRating = serviceNoReviewData[0].rating;
        const newServiceRating = newReviewData.rating;
        const newNoReviews = serviceNoReviewData[0].no_reviews + 1;
        const x = oldRating * (newNoReviews - 1);
        const newRating = ((newServiceRating + x) / newNoReviews).toFixed(1) / 10;
        const serviceUpdateQuery = `update service set no_reviews = ${newNoReviews}, rating = ${newRating} where service_id = '${id}'`;
        const serviceUpdateData = await db.query(serviceUpdateQuery);

        const newNotification = {
            service_id: newReviewData.service_id,
            content: newReviewData.content,
            creator: newReviewData.user_id
        }
        const newNotificationData = await db.query(`
            insert into notification set ?
        `, newNotification)

        const notificationSendToServiceOwner = {
            notification_id: +newNotificationData.insertId,
            user_id: serviceOwner
        }
        const newNotificationSendToServiceOwnerData = await db.query(`
            insert into usernotification set ?
        `, notificationSendToServiceOwner)

        res.json(newReview);
    } catch (err) {
        console.log(err)
        res.json(err);
    }
})

module.exports = router;