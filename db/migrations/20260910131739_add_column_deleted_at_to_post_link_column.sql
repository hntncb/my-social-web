-- migrate:up
ALTER TABLE post_links
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- migrate:down
ALTER TABLE post_links
DROP COLUMN deleted_at;