const express = require('express'),
    router = express.Router(),
    db = require('../database');
// db = require('../config/pg');

// ------- GET SUGGESTION ------ //
router.get('/suggestion/:keyword', async (req, res, next) => {
    try {
        const keyword = req.params.keyword;
        const suggestionsQuery = `select * from keyword where keyword like '%${keyword}%'`
        const suggestionsData = await db.query(suggestionsQuery);
        res.json(suggestionsData);
    } catch (err) {
        console.log(err);
    }
})

router.get('/category', async (req, res, next) => {
    try {
        const categoryQuery = `select * from category`;
        const categoryData = await db.query(categoryQuery);
        res.json(categoryData);
    } catch (err) {
        res.json(err);
    }
})

router.get('/:category/job', async (req, res, next) => {
    try {
        const category = req.params.category;
        const jobQuery = `select job from categoryjobs where category = '${category}'`;
        const jobData = await db.query(jobQuery);
        res.json(jobData)
    } catch (err) {
        console.log(err);
    }
})

router.get('/:job/keywords', async (req, res, next) => {
    try {
        const job = req.params.job;
        const keywordsQuery = `select keyword from jobkeywords where job = '${job}'`;
        const keywordsData = await db.query(keywordsQuery);
        res.json(keywordsData)
    } catch (err) {
        console.log(err);
    }
})

module.exports = router;
