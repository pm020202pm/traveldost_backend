const pool = require('../config/db');
const { sendNotification, fcmToken, sendPhotoNotification, imageUrl } = require('../sendNoti');
const { getPhotoUrl } = require('./auth');


const sendRequest=async (req,res)=>{
    const {request_id, sender_id, receiver_id}= req.body;
    try{
        const requestExisted=await checkRequestExistence(request_id, sender_id, receiver_id);
        if(requestExisted){
            res.status(400).json({error: 'Request Already Exists!'});
            return;
        }
        const query2=`INSERT INTO all_requests (request_id, sender, receiver) VALUES ($1, $2, $3)`
        const result2 = await pool.query(query2, [request_id, sender_id, receiver_id]);
        if(result2.rowCount===0){
            res.status(500).json({error: 'Internal Server Error'});
            return;
        }

        const query3 = `
            SELECT 
                u1.fcm, 
                u2.photo_url, 
                u2.name
            FROM users u1
            JOIN users u2 ON u2.user_id = $2
            WHERE u1.user_id = $1
        `;
        const result3=await pool.query(query3, [receiver_id, sender_id]);
        const imageUrl = result3.rows[0].photo_url??'https://firebasestorage.googleapis.com/v0/b/traveldost-f6a2d.appspot.com/o/images%2Fprofile.jpg?alt=media&token=6d6b2bfd-068d-44a4-9927-4ee3963c6e1a';
        await sendPhotoNotification(result3.rows[0].fcm, 'New Request', `${result3.rows[0].name} is requesting to travel with you!`, imageUrl);
        res.status(200).json({message: 'Request sent successfully'});
    }
    catch(e){
        console.error('Error in sending request:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const cancelRequest=async (req,res)=>{
    const {request_id, sender_id, receiver_id}= req.body;
    try{
        const query=`DELETE FROM all_requests WHERE request_id=$1 AND sender=$2 AND receiver=$3`;
        const result=await pool.query(query, [request_id, sender_id, receiver_id]);  
        if(result.rowCount===0){
            res.status(404).json({error: 'Request not found'});
            return;
        }
        if(result.rowCount===1){
            res.status(200).json({message: 'Request cancelled successfully'});
            return;
        }
        else{
            res.status(500).json({error: 'Internal Server Error'});
        }
    }
    catch(e){
        console.error('Error in cancelling request:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


const approveOrDenyRequest = (request_status) => {
    return async (req, res) => {
        const { request_id, sender_id, receiver_id } =  req.body;
        console.log(request_id, sender_id, receiver_id);
        if (!request_id || !sender_id || !receiver_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            const query = `UPDATE all_requests SET request_status = $1 WHERE request_id = $2 AND sender = $3 AND receiver = $4`;
            const result = await pool.query(query, [request_status, request_id, sender_id, receiver_id]);
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Request not found' });
            }
            const query2 = `
            SELECT 
                u1.fcm,
                u2.name
            FROM users u1
            JOIN users u2 ON u2.user_id = $2
            WHERE u1.user_id = $1
            `;
            const result2 = await pool.query(query2, [sender_id, receiver_id]);
            console.log(result2.rows)
            const title = (request_status=='approved')? 'Request accepted':'Request denied';
            const body = (request_status=='approved')? `${result2.rows[0].name} has accepted your travel request.`:`${result2.rows[0].name} has denied your travel request.`;
            await sendNotification(result2.rows[0].fcm, title, body);
            return res.status(200).json({ message: `Request ${request_status} successfully` });
        } catch (e) {
            console.error('Error in approving/denying request:', e.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};


const getRequests=async (req,res)=>{
    const {user_id}=req.params;
    const {search='', limit=10, page=1, group='ALL'}=req.query;
    const _search = '%' + search.toLowerCase() + '%';
    const offset = (page - 1) * limit;
    try{
        const user = await pool.query(`SELECT email, gender FROM users WHERE user_id = $1;`,[user_id]);

        const email = user.rows[0].email;
        const gender = user.rows[0].gender;
        const batch = 'Y'+parseInt(email.match(/\d+/)[0], 10);
        // const batch = 'Y22';
        console.log(gender)
        console.log(batch)
        const query=`
            SELECT 
                users.name, 
                users.photo_url,
                COALESCE(all_requests.request_status, 'none') AS request_status, 
                requests.user_id, requests.time, requests.date, requests.vehicle, requests.from_place, requests.to_place, requests.request_id,requests.fromcoordinate,requests.tocoordinate
            FROM requests
            JOIN users ON requests.user_id = users.user_id
            LEFT JOIN all_requests ON requests.request_id = all_requests.request_id AND (all_requests.sender = $1 AND all_requests.receiver = requests.user_id)
            WHERE (requests.user_id != $1) 
                AND (users.name ILIKE $2 OR requests.from_place ILIKE $2 OR requests.to_place ILIKE $2) 
                AND $5=ANY(requests.visibility)
                AND ($6=ANY(requests.genderVisibility) OR 'ALL'=ANY(requests.genderVisibility)) 
                AND ($7=users.batch OR $7='ALL')
            ORDER BY requests.created_at DESC LIMIT $3 OFFSET $4;
            `;
        const result=await pool.query(query, [user_id, _search, limit, offset,batch,gender,group]);
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}


const getAllSentRequest=async (req, res)=>{
    try{
        const query=`SELECT * FROM all_requests`;
        const result=await pool.query(query);
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const getMySentRequests=async (req, res)=>{
    const {user_id}=req.params;
    console.log("getMySentRequests");
    console.log(user_id);
    try{
        const query = `
        SELECT users.name, 
               users.photo_url,
               all_requests.receiver, 
               all_requests.request_status, 
               all_requests.request_id, 
               requests.time, 
               requests.date
        FROM all_requests 
        JOIN users ON all_requests.receiver = users.user_id 
        JOIN requests ON requests.request_id = all_requests.request_id 
        WHERE all_requests.sender = $1
        Order by all_requests.created_at DESC
        `;
        const result=await pool.query(query, [user_id]);
        console.log(result.rows);
        if(result.rowCount===0){
            res.status(404).json({error: 'No requests found'});
            return;
        }
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const getMyReceivedRequests=async (req, res)=>{
    const {user_id}=req.params;
    console.log("getMyReceivedRequests");
    try{
        const query = `
        SELECT users.name,
               users.photo_url,
               all_requests.sender, 
               all_requests.request_status, 
               all_requests.request_id
        FROM all_requests 
        JOIN users ON all_requests.sender = users.user_id
        WHERE all_requests.receiver = $1
        Order by all_requests.created_at DESC
        `;
        // const query=`SELECT * FROM all_requests WHERE receiver=$1`;
        const result=await pool.query(query, [user_id]);
        console.log(result.rows);
        if(result.rowCount===0){
            res.status(404).json({error: 'No requests found'});
            return;
        }
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const getMySentOrReceivedRequests=async (req, res)=>{
    const {user_id}=req.params;
    console.log("getMySentOrReceivedRequests");
    try{
        const query = `
        SELECT 
        CASE 
            WHEN all_requests.sender = $1 THEN receiver_user.user_id 
            ELSE sender_user.user_id 
        END AS user_id,

        CASE 
            WHEN all_requests.sender = $1 THEN receiver_user.name 
            ELSE sender_user.name 
        END AS name,

        CASE 
            WHEN all_requests.sender = $1 THEN receiver_user.photo_url 
            ELSE sender_user.photo_url 
        END AS photo_url,

        all_requests.request_status, 
        all_requests.request_id,
        requests.time,
        requests.date,
        CASE 
            WHEN all_requests.sender = $1 THEN 'sent'
            ELSE 'received'
        END AS requestType
        FROM all_requests
        JOIN users AS sender_user ON all_requests.sender = sender_user.user_id
        JOIN users AS receiver_user ON all_requests.receiver = receiver_user.user_id
        JOIN requests ON requests.request_id = all_requests.request_id 
        WHERE (all_requests.receiver = $1 OR all_requests.sender = $1)
        ORDER BY all_requests.created_at DESC;
        `;
        const result=await pool.query(query, [user_id]);
        console.log(result.rows);
        if(result.rowCount===0){
            res.status(404).json({error: 'No requests found'});
            return;
        }
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const checkRequestExistence=async (request_id, sender_id, receiver_id)=>{
    try{
        const query=`SELECT * FROM all_requests WHERE request_id=$1 AND sender=$2 AND receiver=$3`;
        const result=await pool.query(query, [request_id, sender_id, receiver_id]);
        if(result.rowCount===0){
            return false;
        }
        return true;
    }
    catch(e){
        console.error('Error in checking request:', e.message);
        return false;
    }
}

module.exports = {getRequests, sendRequest, getAllSentRequest, cancelRequest, getMySentRequests, getMyReceivedRequests, approveOrDenyRequest, getMySentOrReceivedRequests};
