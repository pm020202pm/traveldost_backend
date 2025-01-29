const { sendOtp, verifyOtp } = require('../models/auth');
const pool = require('../config/db');

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
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const isValid = await verifyOtp(email, otp);
        if (!isValid) {
            return res.status(401).json({ error: 'Authentication failed: Invalid OTP' });
        }

        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        return res.status(200).json({ message: 'OTP verified successfully', user });
    } catch (error) {
        console.error('Error in handleLogin:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const handleRegister = async (req, res) => {
    const { email, otp, name } = req.body;
    if (!email || !otp || !name) {
        return res.status(400).json({ error: 'Email, Name and OTP are required' });
    }
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            console.log('OTP verified');
            const query = `INSERT INTO users (email, name) VALUES ($1, $2)`;
            await pool.query(query, [email, name]);
            res.status(200).json({ message: 'User registered successfully' });
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error in registering:', error.message);
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

const checkUserExistence=async (email)=>{
    try{
        const query=`SELECT * FROM users WHERE email=$1`;
        const result=await pool.query(query, [email]);
        if(result.rowCount===0){
            return false;
        }
        return true;
    }
    catch(e){
        console.error('Error in checking user existence:', e.message);
        return false;
    }
}

module.exports = { handleSendOtp, handleLogin, handleRegister, getAllUsers};