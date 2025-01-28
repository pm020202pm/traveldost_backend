const pool = require('../config/db');

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


const getRequests=async (req,res)=>{
    try{
        const query=`SELECT * FROM requests`;
        const result=await pool.query(query);
        res.status(200).json({requests: result.rows});
    }
    catch(e){
        console.error('Error in getting requests:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}



module.exports = { createRequest, getRequests};
