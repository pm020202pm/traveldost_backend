const pool = require("../config/db");

const getPublicToken =async (req, res)=>{
    const {user_id} = req.body;
    try{
        const query = `SELECT public_key FROM users WHERE user_id = $1`;
        console.log(query);
        const result = await pool.query(query,[user_id]);
        if(result.rowCount===0){
            res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({public_key: result.rows[0].public_key});
    }
    catch(e){
        console.error('Error in getting token:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

const updatePublicKey =async (req, res)=>{
    const {user_id, public_key} = req.body;
    console.log("uploading public key", public_key)
    console.log(user_id)
    try{
        const query = `UPDATE users SET public_key = $2 WHERE user_id=$1 RETURNING *`;
        console.log(query);
        const result = await pool.query(query,[user_id,public_key]);
        if(result.rowCount===0){
            res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({public_key: result.rows[0].public_key});
    }
    catch(e){
        console.error('Error in getting token:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}



module.exports={getPublicToken,updatePublicKey}