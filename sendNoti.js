

const { messaging } = require("./config/firebase");


const sendNotification = async (fcmToken, title, body) => {
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };
  
    try {
      const response = await messaging.send(message);
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };


  const sendPhotoNotification = async (fcmToken, title, body, imageUrl) => {
    const message = {
      token: fcmToken,
      notification: {
        title: title,
        body: body,
        image: imageUrl
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
          },
        },
      },
    };
  
    try {
      const response = await messaging.send(message);
      console.log("✅ Notification sent successfully:", response);
    } catch (error) {
      console.error("❌ Error sending notification:", error);
    }
  };
  
  // Example usage
  const fcmToken = "e8xbe9kmSJq2FvyYz1ATfN:APA91bHQXpm0FdsZ1a9JBlG7lt5wtD8vv9_WTtIgglF9OedLogJ2y8LmeEuzi_bHukyQSr-6QPoAI3Chckrg_l5AQuiLNr3v1xnYNsVY5xHYTtJRIbZ7V9Q"; // Replace with the actual FCM token
  const imageUrl = "https://firebasestorage.googleapis.com/v0/b/iism2024.appspot.com/o/studentPhotos%2Fbhilai%2Fachaudhary%40iitbhilai.ac.in.jpg?alt=media&token=dd900406-3754-496f-b38c-04fdad1624a2";
  // sendPhotoNotification(fcmToken, "Hello!", "This is a test notification.", imageUrl);
  // sendNotification(fcmToken, "safnha", "asfia");
  module.exports = {sendNotification, sendPhotoNotification, imageUrl};
  // sendNotification(fcmToken, "Hello!", "This is a test notification.");, 