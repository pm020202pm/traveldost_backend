const pool = require('../config/db');

const createRequest=async (req, res)=>{
    const {user_id, time, date, vehicle, from, to, visibility,genderVisibility, fromCoordinate, toCoordinate}=req.body;
    console.log(user_id, time, date, vehicle, from, to, visibility,genderVisibility);
    try{
        const query=`INSERT INTO requests (user_id, time, date, vehicle, from_place, to_place, visibility,genderVisibility,fromcoordinate, tocoordinate) VALUES ($1, $2, $3, $4, $5, $6, $7,$8,$9,$10)`;
        await pool.query(query, [user_id, time, date, vehicle, from, to, visibility,genderVisibility,fromCoordinate, toCoordinate]);
        res.status(200).json({message: 'Request created successfully'});
    }
    catch(e){
        console.error('Error in creating request:', e.message);
        res.status(500).json({error: 'Internal Server Error`'});
    }
}

const modifyMyRequest=async (req, res)=>{
    const {request_id, time, date, vehicle, from, to} = req.body;
    try{
        const query = `UPDATE requests SET time=$1, date=$2, vehicle=$3, from_place=$4, to_place=$5, WHERE request_id=$7`;
        const result = await pool.query(query, [time, date, vehicle, from, to, request_id]);
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
        const result=await pool.query(query, [request_id]);
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

// const getSuggestions=async (req, res)=>{
//     const {user_id} = req.params;
//     const {fromLat=26, fromLon=82,timestamp=0} = req.query;
//     try{
//         const user = await pool.query(`SELECT gender,batch FROM users WHERE user_id = $1;`,[user_id]);
//         const gender = user.rows[0].gender;
//         const batch = user.rows[0].batch;
//         console.log(gender, batch, user_id, timestamp);
//         const query=`
//             SELECT 
//                 users.name, 
//                 users.photo_url,
//                 COALESCE(all_requests.request_status, 'none') AS request_status, 
//                 requests.user_id, requests.time, requests.date, requests.vehicle, requests.from_place, requests.to_place, requests.request_id,requests.fromcoordinate,requests.tocoordinate
//             FROM requests
//             JOIN users ON requests.user_id = users.user_id
//             LEFT JOIN all_requests ON requests.request_id = all_requests.request_id AND (all_requests.sender = $1 AND all_requests.receiver = requests.user_id)
//             WHERE (requests.user_id != $1) 
//                 AND $2=ANY(requests.visibility)
//                 AND ($3=ANY(requests.genderVisibility) OR 'ALL'=ANY(requests.genderVisibility))
//                 AND ABS(EXTRACT(EPOCH FROM (date + time)::timestamp)-$4) <= 2700
//             ORDER BY requests.created_at DESC;
//             `;
//         const basedOnTime=await pool.query(query, [user_id,batch,gender,timestamp]);
//         console.log(basedOnTime.rows);
//         if(basedOnTime.rowCount===0){
//             res.status(404).json({error: 'No requests found'});
//             return;
//         }

//         const userLat = fromLat;
//         const userLon = fromLon;
//         const haversineDistance = (lat1, lon1, lat2, lon2) => {
//             const toRad = (deg) => (deg * Math.PI) / 180;
//             const R = 6371; // Radius of Earth in km
//             const dLat = toRad(lat2 - lat1);
//             const dLon = toRad(lon2 - lon1);
//             const a =
//                 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//                 Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
//                 Math.sin(dLon / 2) * Math.sin(dLon / 2);
//             const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//             return R * c; // Distance in km
//         };
//         const timePlaceFilteredRequests = basedOnTime.rows.filter((request) => {
//             const fromCoordinate = request.fromcoordinate;
//             const requestLat = fromCoordinate[0];
//             const requestLon = fromCoordinate[1];
//             const distance = haversineDistance(userLat, userLon, requestLat, requestLon);
//             console.log(distance);
//             if (distance > 3.5) return false;
//             return true;
//         });
//         const timePlaceFilteredSet = new Set(timePlaceFilteredRequests);
//         const filteredRequests = basedOnTime.rows.filter((request) => !timePlaceFilteredSet.has(request));
//         console.log(filteredRequests);
        
//         res.status(200).json({timeFilteredRequests: filteredRequests, timePlaceFilteredRequests: timePlaceFilteredRequests});
//     }
//     catch(e){
//         console.error('Error in getting requests:', e.message);
//         res.status(500).json({error: 'Internal Server Error'});
//     }
// }


const getSuggestions = async (req, res) => {
    const { user_id } = req.params;
    const { fromLat = 26, fromLon = 82, timestamp = 0 } = req.query;

    try {
        const user = await pool.query(`SELECT gender, batch FROM users WHERE user_id = $1;`, [user_id]);
        const gender = user.rows[0].gender;
        const batch = user.rows[0].batch;

        const query = `
            SELECT 
                users.name, 
                users.photo_url,
                COALESCE(all_requests.request_status, 'none') AS request_status, 
                requests.user_id, requests.time, requests.date, requests.vehicle, 
                requests.from_place, requests.to_place, requests.request_id,
                (6371 * acos(
                    cos(radians($4)) * cos(radians((requests.fromcoordinate[1]))) *
                    cos(radians((requests.fromcoordinate[2])) - radians($5)) +
                    sin(radians($4)) * sin(radians((requests.fromcoordinate[1])))
                )) AS distance,
                ABS(EXTRACT(EPOCH FROM (date::timestamp + time)) - $6) AS timeDiff
            FROM requests
            JOIN users ON requests.user_id = users.user_id
            LEFT JOIN all_requests ON requests.request_id = all_requests.request_id 
                AND (all_requests.sender = $1 AND all_requests.receiver = requests.user_id)
            WHERE (requests.user_id != $1) 
                AND $2 = ANY(requests.visibility)
                AND ($3 = ANY(requests.genderVisibility) OR 'ALL' = ANY(requests.genderVisibility))
                AND ABS(EXTRACT(EPOCH FROM (date::timestamp + time)) - $6) <= 2700
                AND (6371 * acos(
                    cos(radians($4)) * cos(radians((requests.fromcoordinate[1]))) *
                    cos(radians((requests.fromcoordinate[2])) - radians($5)) +
                    sin(radians($4)) * sin(radians((requests.fromcoordinate[1])))
                )) <= 4
            ORDER BY distance ASC, timeDiff ASC;
        `;
        // AND ABS(EXTRACT(EPOCH FROM (date::timestamp + time)) - $4) <= 2700

        const basedOnTime = await pool.query(query, [user_id, batch, gender, fromLat, fromLon, timestamp]);
        console.log(basedOnTime.rows);
        if (basedOnTime.rowCount === 0) {
            return res.status(404).json({ error: 'No requests found' });
        }

        res.status(200).json({ timePlaceFilteredRequests: basedOnTime.rows,  timeFilteredRequests: basedOnTime.rows });
    } catch (e) {
        console.error('Error in getting requests:', e.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports={createRequest, modifyMyRequest, deleteMyRequest, getMyRequest, getSuggestions};