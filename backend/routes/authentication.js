const express = require('express'),
    router = express.Router(),
    bcript = require('bcrypt'),
    db = require('../database');
// db = require('../config/pg');

require('dotenv').config();

router.post('/signup', async (req, res) => {
    try {
        let { email, name, password, cover, userId } = req.body;
        const checkUserExisted = await db.query(`select user_id from users where user_id = '${userId}'`);
        if (checkUserExisted.length === 0) {
            const hashedPassword = await bcript.hash(password, 10);
            if (!cover) {
                cover = 'https://images.unsplash.com/photo-1591210349711-afe796e7d572?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=829&q=80'
            }
            if (!name) {
                name = 'New user'
            }
            const newUser = [userId, cover, name, 'Some description', email, hashedPassword, new Date()];
            const newUserQuery = `insert into users(user_id, cover, name, description, email, password, last_active) values ?`;
            const newUserData = await db.query(newUserQuery, [[newUser]]);
            res.json({ status: 'success' })
        } else {
            res.json({ status: 'failure' })
        }
    } catch (err) {
        console.log(err);
        res.status(400).json({ status: 'failure' })
    }
})

module.exports = router;