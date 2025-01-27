const express = require('express');
const { handleSendOtp, handleRegister, handleLogin } = require('../controllers/auth');
const router = express.Router();

router.post('/requestotp', handleSendOtp); 
router.post('/register', handleRegister);
router.post('/login', handleLogin);

module.exports = router;
