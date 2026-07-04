const express = require('express');
const { handleSendOtp, handleRegister, handleLogin, getAllUsers, checkUserExistence } = require('../controllers/auth');
const router = express.Router();

router.post('/requestotp', handleSendOtp); 
router.get('/isUserExist', checkUserExistence);
router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.get('/getAllUsers', getAllUsers);

module.exports = router;
