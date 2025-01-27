const express = require('express');
const { createRequest, getRequests } = require('../controllers/request');
const router = express.Router();

router.post('/createRequest', createRequest);
router.get('/getRequests', getRequests);

module.exports = router;