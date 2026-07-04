const pool = require("../config/db");


const updateProfile=async (req,res)=>{
    const {user_id,photo_url} = req.body;
    try{
        const query = `UPDATE users SET photo_url=$1 WHERE user_id=$2`
        const result = await pool.query(query,[photo_url,user_id]);
        if(result.rowCount===0){
            res.status(404).json({error: 'User not found'});
        }
        res.status(200).json({message: 'Profile updated successfully'});
    }
    catch(e){
        console.error('Error in updating profile:', e.message);
        res.status(500).json({error: 'Internal Server Error'});
    }
}

module.exports=updateProfile;