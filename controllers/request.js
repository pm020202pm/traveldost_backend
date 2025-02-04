const pool = require('../config/db');
const { use } = require('../routes/requests');

const createRequest=async (req, res)=>{
    const {user_id, time, date, vehicle, from, to, message}=req.body;
    console.log(user_id, time, date, vehicle, from, to, message);
    try{
        const query=`INSERT INTO requests (user_id, time, date, vehicle, from_place, to_place, message) VALUES ($1, $2, $3, $4, $5, $6, $7)`;
        await pool.query(query, [user_id, time, date, vehicle, from, to, message]);
        res.status(200).json({message: 'Request created successfully'});
    }
    catch(e){
        console.error('Error in creating request:', e.message);
        res.status(500).json({error: 'Internal Server Error`'});
    }
}

const modifyMyRequest=async (req, res)=>{
    const {request_id, time, date, vehicle, from, to, message} = req.body;
    try{
        const query = `UPDATE requests SET time=$1, date=$2, vehicle=$3, from_place=$4, to_place=$5, message=$6 WHERE request_id=$7`;
        const result = await pool.query(query, [time, date, vehicle, from, to, message, request_id]);
        if(result.rowCount===0){
            res.status(404).json({message: 'Request not found'});
            return;
        }
        res.status(200).json({message: 'Request modified successfully'});
    }
    catch(e){
        console.error('Error in modifying request:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const deleteMyRequest=async (req, res)=>{
    const {request_id}=req.body;
    try{
        const query=`DELETE FROM requests WHERE request_id=$1`;
        const query2=`DELETE FROM all_requests WHERE request_id=$1`;
        const result=await pool.query(query, [request_id]);
        const result2=await pool.query(query2, [request_id]);
        if(result.rowCount===0){
            res.status(404).json({error: 'Request not found'});
            return;
        }
        res.status(200).json({message: 'Request deleted successfully'});
    }
    catch(e){
        console.error('Error in deleting request:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const getMyRequest=async (req, res)=>{
    const {user_id}=req.params;
    console.log(user_id);
    try{
        const query=`SELECT * FROM requests WHERE user_id=$1`;
        const result=await pool.query(query, [user_id]);
        if(result.rowCount===0){
            res.status(404).json({error: 'No requests found'});
            return;
        }
        res.status(200).json({requests: result.rows[0]});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const sendRequest=async (req,res)=>{
    const {request_id, sender_id}= req.body;
    try{
        const query1=`SELECT * FROM requests WHERE request_id=$1`;
        const result1=await pool.query(query1, [request_id]);
        if(result1.rowCount===0){
            res.status(404).json({error: 'Request not found'});
            return;
        }
        const receiver_id=result1.rows[0].user_id;
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
            return res.status(200).json({ message: `Request ${request_status} successfully` });
        } catch (e) {
            console.error('Error in approving/denying request:', e.message);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};


const getRequests=async (req,res)=>{
    const {user_id}=req.params;
    try{
        const query=`
            SELECT 
                users.name, users.photo_url,
                COALESCE(all_requests.request_status, 'none') AS request_status, 
                requests.user_id, requests.time, requests.date, requests.vehicle, requests.from_place, requests.to_place, requests.message, requests.request_id
            FROM requests
            JOIN users ON requests.user_id = users.user_id
            LEFT JOIN all_requests ON requests.request_id = all_requests.request_id AND (all_requests.sender = $1 AND all_requests.receiver = requests.user_id)
            WHERE requests.user_id != $1;
            `;
        const result=await pool.query(query, [user_id]);
        console.log(result.rows);
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
               all_requests.receiver, 
               all_requests.request_status, 
               all_requests.request_id, 
               requests.time, 
               requests.date
        FROM all_requests 
        JOIN users ON all_requests.receiver = users.user_id 
        JOIN requests ON requests.request_id = all_requests.request_id 
        WHERE all_requests.sender = $1
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
               all_requests.sender, 
               all_requests.request_status, 
               all_requests.request_id
        FROM all_requests 
        JOIN users ON all_requests.sender = users.user_id
        WHERE all_requests.receiver = $1
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

module.exports = { createRequest, modifyMyRequest, deleteMyRequest, getMyRequest, getRequests, sendRequest, getAllSentRequest, cancelRequest, getMySentRequests, getMyReceivedRequests, approveOrDenyRequest};
