const { sendOtp, verifyOtp } = require('../models/auth');
const db = require('../config/db');

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


const handleLogin=async (req,res)=>{
    const { email, otp } = req.body;
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            try {
                const query = 'SELECT * FROM users WHERE email = ?';
                const [rows] = await db.execute(query, [email]);
                if (rows.length > 0) {
                    res.status(200).json({ message: 'OTP verified', user: rows[0]});
                } else {
                    res.status(404).json({ error: 'Player not found' });
                }
            } catch (dbError) {
                console.error('Database query error:', dbError.message);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const handleRegister = async (req, res) => {
    const { email, otp, name } = req.body;
    try {
        const isValid = await verifyOtp(email, otp);
        if (isValid) {
            console.log('OTP verified');
            const query = `INSERT INTO users (email, name) VALUES (?, ?)`;
            await db.execute(query, [email, name]);
            res.status(200).json({ message: 'User registered successfully' });
        } else {
            res.status(402).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error in registering:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { handleSendOtp, handleLogin, handleRegister };