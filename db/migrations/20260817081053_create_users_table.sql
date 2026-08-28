-- migrate:up
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,                
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,                           
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()   
);

-- migrate:down
DROP TABLE IF EXISTS users;