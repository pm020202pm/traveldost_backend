const express = require('express');
const { createRequest, getRequests, sendRequest, getAllSentRequest, cancelRequest, getMySentRequests, getMyReceivedRequests, approveOrDenyRequest, modifyMyRequest, deleteMyRequest, getMyRequest } = require('../controllers/request');
const router = express.Router();

router.post('/createRequest', createRequest);
router.post('/modifyRequest', modifyMyRequest);
router.post('/deleteRequest', deleteMyRequest);
router.get('/getMyRequest/:user_id', getMyRequest);
router.get('/getRequests/:user_id', getRequests);
router.post('/sendRequest', sendRequest);
router.get('/getAllSentRequest', getAllSentRequest);
router.post('/cancelRequest', cancelRequest);
router.get('/getMySentRequests/:user_id', getMySentRequests);
router.get('/getMyReceivedRequests/:user_id', getMyReceivedRequests);
router.post('/approveRequest', approveOrDenyRequest('approved'));
router.post('/denyRequest', approveOrDenyRequest('denied'));

module.exports = router;