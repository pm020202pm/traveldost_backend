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

