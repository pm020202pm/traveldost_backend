const admin = require('firebase-admin');
const serviceAccount = require('../traveldost-f6a2d-firebase-adminsdk-inmjk-eb77760473.json'); // Adjust path as necessary

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://traveldost-f6a2d.appspot.com', // Replace with your actual bucket name
});

// Export the bucket for use in other files
const firestore = admin.firestore();
const messaging = admin.messaging();
const bucket = admin.storage().bucket();
module.exports = {bucket, firestore, messaging};