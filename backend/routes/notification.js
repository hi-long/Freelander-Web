const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

router.get('/:id/notifications', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const notificationsData = await db.query(`
            select notification.*, users.name, service.type, usernotification.seen	
            from usernotification
            join notification using(notification_id)
            join users on notification.creator = users.user_id
            join service using (service_id)
            where usernotification.user_id = '${userId}'
            order by created desc;
        `)
        res.json(notificationsData)
    } catch (err) {
        console.log(err);
    }
})

router.put('/:id/notifications', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const seenNotifications = await db.query(`
            update usernotification
            set seen = true
            where user_id = '${userId}'
        `)
        res.json(seenNotifications);
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;