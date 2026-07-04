const { sendOtp, verifyOtp } = require('../models/auth');
//
const pool = require('../config/db');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const secretKey = process.env.SECRET_KEY;
const handleSendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await sendOtp(email);
        res.status(200).send('OTP sent successfully');
    } catch (error) {
        console.error('Error in sending OTP:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const handleLogin = async (req, res) => {
    const { email, otp, fcm} = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const isValid = await verifyOtp(email, otp);
        if (!isValid) {
            return res.status(401).json({ error: 'Authentication failed: Invalid OTP' });
        }
        const query= 'UPDATE users SET fcm=$1 WHERE email=$2 RETURNING *';
        const result = await pool.query(query, [fcm,email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        const token = jwt.sign({ email: email }, secretKey);
        const user = result.rows[0];
        user.photo_url = getPhotoUrl(user.email);
        console.log("token: ",token)
        return res.status(200).json({ message: 'OTP verified successfully', user: user, token:token });
    } catch (error) {
        console.error('Error in handleLogin:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const handleRegister = async (req, res) => {
    const { email, otp, name, fcm,gender} = req.body;
    if (!email || !otp || !name) {
        return res.status(400).json({ error: 'Email, Name and OTP are required' });
    }
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            console.log('OTP verified');
            const batch = 'Y'+parseInt(email.match(/\d+/)[0], 10);
            const photo_url = getPhotoUrl(email);
            const query = `INSERT INTO users (email, name, photo_url, fcm,gender,batch) VALUES ($1, $2, $3, $4,$5,$6) RETURNING *`;
            const result = await pool.query(query, [email, name, photo_url, fcm,gender,batch]);
            const user = result.rows[0];
            user.photo_url = getPhotoUrl(user.email);
            const token = jwt.sign({ email: email }, secretKey);
            res.status(200).json({  message: 'User registered successully', user: user, token:token });
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error in registering:', error.message);
        if(error.message.includes('duplicate key value violates unique constraint "users_email_key"')){
            console.log('User already exists');
            return res.status(409).json({ error: 'User already exists' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getAllUsers = async (req, res) => {
    try {
        const query = 'SELECT * FROM users';
        const result = await pool.query(query);
        res.status(200).json({ users: result.rows });
    }
    catch (e) {
        console.error('Error in getting users:', e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const checkUserExistence=async (req, res)=>{
    const {email}=req.query;
    try{
        const query=`SELECT * FROM users WHERE email=$1`;
        const result=await pool.query(query, [email]);
        if(result.rowCount===0){
            res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({message: 'User found'});
    }
    catch(e){
        console.error('Error in checking user existence:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const getPhotoUrl = (emailId)=>{
    const url = `https://firebasestorage.googleapis.com/v0/b/traveldost-f6a2d.appspot.com/o/images%2F${emailId}?alt=media`;
    return url;
}

module.exports = { handleSendOtp, handleLogin, handleRegister, getAllUsers, checkUserExistence, getPhotoUrl };