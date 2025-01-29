const express = require('express');
const { createRequest, getRequests, sendRequest, getAllSentRequest, cancelRequest, getMySentRequests, getMyReceivedRequests, approveRequest, approveOrDenyRequest, modifyMyRequest } = require('../controllers/request');
const router = express.Router();

router.post('/createRequest', createRequest);
router.post('/modifyRequest', modifyMyRequest)
router.get('/getRequests', getRequests);
router.post('/sendRequest', sendRequest);
router.get('/getAllSentRequest', getAllSentRequest);
router.post('/cancelRequest', cancelRequest);
router.get('/getMySentRequests', getMySentRequests);
router.get('/getMyReceivedRequests', getMyReceivedRequests);
router.post('/approveRequest', approveOrDenyRequest('approved'));
router.post('/denyRequest', approveOrDenyRequest('denied'));

module.exports = router;