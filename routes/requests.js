const express = require('express');
const { getRequests, sendRequest, getAllSentRequest, cancelRequest, getMySentRequests, getMyReceivedRequests, approveOrDenyRequest, getMySentOrReceivedRequests} = require('../controllers/request');
const authenticateToken = require('../middlewares/verifyToken');
const { createRequest, modifyMyRequest, deleteMyRequest, getMyRequest, getSuggestions } = require('../controllers/myRequestsController');
const router = express.Router();

router.post('/createRequest',authenticateToken, createRequest);
router.post('/modifyRequest',authenticateToken, modifyMyRequest);
router.post('/deleteRequest',authenticateToken, deleteMyRequest);
router.get('/getMyRequest/:user_id',authenticateToken, getMyRequest);
router.get('/getRequests/:user_id',authenticateToken, getRequests);
router.post('/sendRequest',authenticateToken, sendRequest);
router.get('/getAllSentRequest',authenticateToken, getAllSentRequest);
router.post('/cancelRequest',authenticateToken, cancelRequest);
router.get('/getMySentRequests/:user_id',authenticateToken, getMySentRequests);
router.get('/getMyReceivedRequests/:user_id',authenticateToken, getMyReceivedRequests);
router.get('/getMySentOrReceivedRequests/:user_id', getMySentOrReceivedRequests);
router.post('/approveRequest',authenticateToken, approveOrDenyRequest('approved'));
router.post('/denyRequest',authenticateToken, approveOrDenyRequest('denied'));
router.get('/getSuggestions/:user_id',authenticateToken,getSuggestions);

module.exports = router;