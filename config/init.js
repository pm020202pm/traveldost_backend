const pool = require("./db");

const createTables = async () => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                name VARCHAR(100),
                photo_url VARCHAR(255),
                public_key TEXT NOT NULL
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS requests (
                request_id SERIAL PRIMARY KEY,
                user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
                time TIME NOT NULL,
                date DATE NOT NULL,
                vehicle VARCHAR(50),
                from_place VARCHAR(100),
                to_place VARCHAR(100),
                message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                visibility VARCHAR(50)[],
                genderVisibility VARCHAR(30)[],
                fromCoordinate DOUBLE PRECISION[],
                toCoordinate DOUBLE PRECISION[]
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS all_requests (
                request_id INT NOT NULL,
                sender INT NOT NULL,
                receiver INT NOT NULL,
                request_status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY(request_id, sender, receiver),
                FOREIGN KEY(request_id) REFERENCES requests(request_id) ON DELETE CASCADE,
                FOREIGN KEY(sender) REFERENCES users(user_id) ON DELETE CASCADE,
                FOREIGN KEY(receiver) REFERENCES users(user_id) ON DELETE CASCADE
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS chats (
                id SERIAL PRIMARY KEY,
                user1_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                user2_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                last_message TEXT,
                encrypted_aes_key TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                receiver_id INT REFERENCES users(user_id) ON DELETE CASCADE,
                chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
                message_text TEXT NOT NULL,
                encrypted_aes_key TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'sent'
            );
        `);

        await client.query("COMMIT");

        console.log("✅ Tables created successfully.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error(err);
    } finally {
        client.release();
        pool.end();
    }
};

createTables();