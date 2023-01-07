const express = require('express');
const router = express.Router();
const logger = require('../util/logger');
const { selectVideos } = require('../util/mysql');
const { toNumber, toMysqlDate, sanitizeLikeString } = require('../util/parser');


// GET /api
router.get('/', function(req, res) {
    // get the query parameters
    let { limit, page, order, publishedAfter, publishedBefore, query } = req.query;
    // set the default values - input sanitization to avoid SQL injection
    limit = toNumber(limit, 10);
    page = toNumber(page, 1);
    order = (order && order.toUpperCase() !== 'ASC') ? 'DESC' : 'ASC';
    if (publishedAfter) {
        publishedAfter = toMysqlDate(publishedAfter);
    }
    if (publishedBefore) {
        publishedBefore = toMysqlDate(publishedBefore);
    }
    if (query) {
        query = sanitizeLikeString(query);
    }
    // log the request
    logger.info('GET /api', { limit, page, order, publishedAfter, publishedBefore });
    // get the videos
    selectVideos({ limit, page, order, publishedAfter, publishedBefore }).then(videos => {
        logger.info('Successfully selected videos from the database');
        return res.status(200).json({ videos });
    }).catch(err => {
        logger.error('Error selecting videos from the database', { error: err });
        return res.status(500).json({ error: err });
    });
});

module.exports = router;
