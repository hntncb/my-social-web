-- migrate:up
CREATE TYPE link_category AS ENUM ('video', 'audio', 'image', 'other');

CREATE TABLE IF NOT EXISTS post_links (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id BIGINT NOT NULL,                
    url TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    category link_category NOT NULL DEFAULT 'other',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_post_post_links
    FOREIGN KEY (post_id)
    REFERENCES posts(id)
    ON DELETE CASCADE
);

-- index
CREATE INDEX IF NOT EXISTS idx_post_links_post_id_position 
ON post_links(post_id, position);

-- migrate:down
DROP TYPE IF EXISTS link_category;
DROP TABLE IF EXISTS post_links;