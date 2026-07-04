
const express = require('express');
const authenticateToken = require('../middlewares/verifyToken');
const { getPublicToken, updatePublicKey } = require('../controllers/encryptionController');
const router = express.Router();

router.post('/getPublicToken', authenticateToken, getPublicToken)
router.post('/updatePublicToken', authenticateToken, updatePublicKey)

module.exports=router;