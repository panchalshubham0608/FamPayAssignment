const express = require('express');
const router = express.Router();
const logger = require('../util/logger');

// renders the dashboard page
router.get('/', function(req, res) {
  // log the request
  logger.info('GET /');
  return res.render('index');
});

module.exports = router;
