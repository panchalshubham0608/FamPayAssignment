const express = require('express');
const router = express.Router();
const logger = require('../util/logger');
const { selectVideos } = require('../util/mysql');
const { searchQueryParams } = require('../util/params');

// GET /api
router.get('/', function(req, res) {
    // get the query parameters
    const searchParams = searchQueryParams(req.query);
    // log the request
    logger.info('GET /api', searchParams);
    // get the videos
    selectVideos(searchParams).then(videos => {
        logger.info('Successfully selected videos from the database');
        // count the videos
        selectVideos({ ...searchParams, justCount: true }).then(totalCount => {
            logger.info('Successfully selected videos count from the database');
            return res.status(200).json({ totalCount, videos });
        }).catch(err => {
            logger.error('Error selecting videos count from the database', { error: err });
            return res.status(500).json({ error: err });
        });
    }).catch(err => {
        logger.error('Error selecting videos from the database', { error: err });
        return res.status(500).json({ error: err });
    });
});

module.exports = router;
