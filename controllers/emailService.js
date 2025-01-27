const nodemailer = require('nodemailer');
require('dotenv').config();


// Set up transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text
    };
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
