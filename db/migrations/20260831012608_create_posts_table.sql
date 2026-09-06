-- migrate:up
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,                
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),  
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_post_author
    FOREIGN KEY (author_id)
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- index
CREATE INDEX IF NOT EXISTS idx_posts_author_created 
ON posts(author_id, created_at DESC)
WHERE deleted_at IS NULL;

-- migrate:down
DROP TABLE IF EXISTS posts;