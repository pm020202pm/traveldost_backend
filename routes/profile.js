const express = require('express');
const authenticateToken = require('../middlewares/verifyToken');
const updateProfile = require('../controllers/profileController');
const router = express.Router();

router.post('/updateProfile', authenticateToken, updateProfile)

module.exports=router;