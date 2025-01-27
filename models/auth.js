const crypto = require('crypto');
const sendEmail = require('../controllers/emailService');

// Store OTPs temporarily (use a more persistent store for production)
const otpStorage = {};
const otpExpirationTime = 5 * 60 * 1000; // 5 minutes

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}


async function sendOtp(contact) {
    const otp = generateOTP();
    const email = contact.replace(/\s+/g, '');
    const expiration = Date.now() + otpExpirationTime;
    console.log(`Generated OTP for ${email}: ${otp}, expires at ${new Date(expiration)}`);
    otpStorage[email] = { otp, expiration };
    console.log(otpStorage);
    if (email.includes('@')) {
        await sendEmail(contact, 'Your OTP Code', `Your OTP code is ${otp} to login to the Inter IIT Sports Meet '24 App.\n\nThis OTP is valid for 5 minutes.\n\nPlease do not share this OTP with anyone.\n\nThank you.\nInter IIT Sports Meet '24 Team`);
    }
}

async function verifyOtp(contact, otp) {
    const email = contact.replace(/\s+/g, '');
    const storedOtpData = otpStorage[email];
    console.log(otpStorage);
    console.log(`Verifying OTP for contact: ${email}`);
 
    if (!storedOtpData) {
        console.log(`No OTP found for email: ${storedOtpData}`);
        return false;
    }
    const { otp: storedOtp, expiration } = storedOtpData;

    if (Date.now() > expiration) {
        console.log(`OTP for contact ${email} has expired.`);
        delete otpStorage[email]; // Delete expired OTP
        return false;
    }

    const isValid = String(storedOtp) === String(otp);
    
    if (!isValid) {
        console.log(`Invalid OTP for contact: ${email}`);
        return false;
    }

    delete otpStorage[email];
    console.log(`OTP verified for contact: ${email}`);
    return true;
}


module.exports = { sendOtp, verifyOtp };
