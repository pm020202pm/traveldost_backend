const express = require('express');
const pool = require('../config/db');
const authenticateToken = require('../middlewares/verifyToken');
const router = express.Router();

// Fetch all chats for a user
router.get('/chats/:userId',authenticateToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT c.id AS id, 
                   u.user_id AS user_id, 
                   u.name, 
                   u.email, 
                   u.photo_url,
                   u.public_key AS sender_public_key_base64,
                   u.fcm,
                   c.last_message, 
                   c.updated_at,
                   c.encrypted_aes_key,
                   c.iv,
                   c.mac
            FROM chats c
            JOIN users u ON (c.user1_id = u.user_id OR c.user2_id = u.user_id)
            WHERE (c.user1_id = $1 OR c.user2_id = $1) AND u.user_id != $1 AND c.encrypted_aes_key!='null'
            ORDER BY c.updated_at DESC
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start a new chat
router.post('/chats',authenticateToken, async (req, res) => {
    console.log('start new chat')
    try {
        const { user1Id, user2Id } = req.body;
        const query = `
            SELECT c.id AS id, 
                   u.user_id AS user_id, 
                   u.name, 
                   u.email,
                   u.fcm,
                   u.public_key AS sender_public_key_base64, 
                   u.photo_url,
                   u.public_key,
                   c.last_message, 
                   c.updated_at,
                   c.encrypted_aes_key,
                   c.iv,
                   c.mac
            FROM chats c
            JOIN users u ON (u.user_id=$2)
            WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `;
        const checkQuery = `
        SELECT * 
        FROM chats 
        WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
        `;
        const existingChat = await pool.query(query, [user1Id, user2Id]);

        if (existingChat.rows.length > 0) {
            return res.json({ chat: existingChat.rows[0] });
        }

        const insertQuery = `INSERT INTO chats (user1_id, user2_id) VALUES ($1, $2)`;
        const result = await pool.query(insertQuery, [user1Id, user2Id]);
        if(result.rowCount==0){
            return res.status(500).json({error: "Error creating chat"});
        }
        const newChat= await pool.query(query, [user1Id, user2Id]);
        res.status(200).json({ chat: newChat.rows[0] });    
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch messages for a chat
router.get('/messages/:chatId',authenticateToken, async (req, res) => {
    try {
        const { chatId } = req.params;
        const {page=1, limit=10} = req.query;
        const offset = (page - 1) * limit;
        // cross join with users table to get the sender's name and photo_url
        const query = `
            SELECT m.*, u.name AS sender_name, u.photo_url AS sender_photo_url, u.public_key AS sender_public_key_base64
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.chat_id = $1
            ORDER BY m.timestamp DESC
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [chatId, limit, offset]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
