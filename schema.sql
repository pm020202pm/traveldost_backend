CREATE TABLE requests(
    request_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    time TIME NOT NULL,
    date DATE NOT NULL,
    vehicle VARCHAR(50),
    from_place VARCHAR(100),
    to_place VARCHAR(100),
    message VARCHAR(255),
    created_at TIMESTAMP DEFAULT current_timestamp
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
    photo_url VARCHAR(255)
);