const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const request = require('./routes/requests');
const pool = require('./config/db');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', request);
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Database time:', res.rows[0]);
    }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});