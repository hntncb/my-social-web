-- migrate:up
ALTER TABLE post_links
ADD CONSTRAINT add_unique_post_id UNIQUE (post_id)

-- migrate:down
ALTER TABLE post_links
DROP CONSTRAINT add_unique_post_id