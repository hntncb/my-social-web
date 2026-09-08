import pool from "../../database/pool.js"

export const findPostsWithOffset = async (limit,offset) => {
    const result = await pool.query(
        `SELECT * FROM posts
        WHERE deleted_at IS NULL
        ORDER BY created_at
        LIMIT $1 OFFSET $2
        `,
        [limit,offset]
    );
    return result.rows;
}

export const findPostsWithCursor = async (post_id, limit) => {

    const result = await pool.query(
        `SELECT * FROM posts
        WHERE deleted_at IS NULL
            AND id > $1 
        ORDER BY created_at LIMIT $2
        `,
        [post_id, limit]
    );
    return result.rows;
}

export const createPost = async (title, content, author_id) => {
    const result = await pool.query(
        `INSERT INTO posts 
        (title, content, author_id)
        VALUES($1,$2,$3)
        RETURNING *
        `,
        [title,content,author_id]
    );
    return result.rows[0] ?? null;
}

export const createPostWithUrl = async (title, content, author_id, url) => {
    const client = await pool.connect();
    
    try {
        
        await client.query("BEGIN");

        const postResult = await client.query("INSERT INTO posts (title, content, author_id) VALUES ($1,$2,$3) RETURNING *",[title, content, author_id]);

        const post = postResult.rows[0];

        await client.query("INSERT INTO post_links (post_id, url) VALUES ($1,$2) RETURNING *",[post.id, url]);

        await client.query("COMMIT");

        return {...post, url};

    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export const updatePostById = async () => {
    //chưa hoàn thiện
    /*const result = await pool.query(
        `UPDATE posts
        SET 
        WHERE
        RETURNING 
        `,
    );
    return result.rows[0] ?? null;*/
    return null;
}

export const deletePostById = async (id) => {
    //chưa hoàn thiện
    /*const result = await pool.query(
        `UPDATE posts
        SET deleted_at = NOW()
        WHERE id = $1
        RETURNING deleted_at
        `,
        [id]
    );
    return result.rows[0] ?? null;*/
    return null;
}