// const express = require('express');
// const cors = require('cors');
// const app = express();
// const authRoutes = require('./routes/auth');
// const request = require('./routes/requests');
// const pool = require('./config/db');

// app.use(cors());
// app.use(express.json());
// app.use('/api/auth', authRoutes);
// app.use('/api', request);
// pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('Database time:', res.rows[0]);
//     }
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}.`);
// });


const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const request = require('./routes/requests');
const encryption = require('./routes/encryption');
const pool = require('./config/db');
const { sendPhotoNotification, sendNotification } = require('./sendNoti');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// const io = new Server(server, {
//     cors: {
//         origin: "*",
//     }
// });

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', request);
app.use('/api/chat', chatRoutes);
app.use('/api', encryption)

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Database time:', res.rows[0]);
    }
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a room based on userId
    // socket.on('join_chat', (userId) => {
    //     socket.join(userId);
    //     console.log(`User ${userId} joined room ${userId}`);
    // });
    const userId = socket.handshake.query.userId;
    if (userId) {
        socket.join(userId);  // Join a room with user ID
        console.log(`✅ User ${userId} joined room ${userId}`);
    }

    socket.on('send_message', async ({ chatId, senderId, receiverId, message, encryptedAESKey,iv,fcm, senderName}) => {
        console.log(fcm);
        try {
            const query = `INSERT INTO messages (chat_id, sender_id, receiver_id, message_text, encrypted_aes_key,iv) 
                           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
            const values = [chatId, senderId, receiverId, message, encryptedAESKey,iv];
            const result = await pool.query(query, values);
    
            // Update last message in chats table
            await pool.query(`UPDATE chats SET last_message = $1, encrypted_aes_key=$2, iv=$3,  updated_at = NOW() WHERE id = $4`, [message,encryptedAESKey,iv,chatId]);
            io.to(receiverId).emit('receive_message', result.rows[0]);
            await sendNotification(fcm,"New Message",`${senderName} sent you a message.`);
            console.log(`Message sent from ${senderId} to ${receiverId}`);
        } catch (error) {
            console.error("Message sending error:", error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});



