-- migrate:up
ALTER TABLE IF EXISTS users 
ALTER COLUMN role SET DEFAULT 'user';

-- migrate:down
ALTER TABLE IF EXISTS users 
ALTER COLUMN role SET DEFAULT 'users';
