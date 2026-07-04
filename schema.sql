CREATE TABLE requests(
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    time TIME NOT NULL,
    date DATE NOT NULL,
    vehicle VARCHAR(50),
    from_place VARCHAR(100),
    to_place VARCHAR(100),
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT current_timestamp,
    visibility VARCHAR(50)[],
    genderVisibility VARCHAR(30)[],
    fromCoordinate DOUBLE PRECISION[2], 
    toCoordinate DOUBLE PRECISION[2];
);

CREATE TABLE all_requests(
    request_id INT NOT NULL,
    sender INT NOT NULL,
    receiver INT NOT NULL,
    request_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT current_timestamp
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    photo_url VARCHAR(255),
    public_key TEXT NOT NULL
);

CREATE TABLE chats (
    id SERIAL PRIMARY KEY,
    user1_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    user2_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    last_message TEXT,
    encrypted_aes_key TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    chat_id INT REFERENCES chats(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    encrypted_aes_key TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'sent'
);