-- migrate:up
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    post_id VARCHAR(255) NOT NULL,
    parent_id VARCHAR(255) NOT NULL,
    content VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
    delete_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_comment_post
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_comment_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

    CONSTRAINT fk_comment_parent
    FOREIGN KEY (parent_id)
    REFERENCES comments(id)
    ON DELETE CASCADE
);

-- migrate:down
DROP TABLE IF EXISTS comments;