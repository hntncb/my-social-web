import pool from "../../database/pool.js"

export const findPostById = async (id) => {
    const result = await pool.query(
        `SELECT * FROM posts
        WHERE deleted_at IS NULL 
        AND id = $1
        `,
        [id]
    );
    return result.rows[0];
};

export const findPostsWithOffset = async (limit,offset) => {
    const result = await pool.query(
        `SELECT * FROM posts
        WHERE deleted_at IS NULL
        ORDER BY created_at ASC, id ASC
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
        ORDER BY created_at ASC, id ASC LIMIT $2
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
    };
};

export const updatePostById = async (client, id, data) => {
    let index = 1;
    let sqlString = "";
    const values = [];
    for (const [key, value] of Object.entries(data)){
        if(index >= 2){
            sqlString += `,`
        }
        sqlString += `${key} = $${index}`;
        values.push(value);
        index++;
    };
    
    values.push(id);

    const sql =`UPDATE posts
        SET ${sqlString}
        WHERE deleted_at IS NULL 
        AND id = $${index}
        RETURNING *
        `
    const result = await client.query(sql, values);
    return result.rows[0] ?? null;
}

export const upsertPostLink = async (client, id, data) => {
    let index = 1;
    let sqlString = "";
    let post_id = id;
    const values = [];
    for (const [key, value] of Object.entries(data)){
        if(index >= 2){
            sqlString += `,`
        }
        sqlString += `${key}`;
        values.push(value);
        index++;
    };
    
    values.push(post_id);
    console.log(values);
    const sql = `
        INSERT INTO post_links (${sqlString}, post_id)
        VALUES ($1, $2)
        ON CONFLICT (post_id)
        DO UPDATE SET url = EXCLUDED.url
        RETURNING *
    `;
    const result = await client.query(sql, values);
    return result.rows[0] ?? null;
}

/*export const updatePostWithURLById = async (id, data) => {
    const client = await pool.connect();
    let index = 1;
    let index2 = 1;
    let sqlString = "";
    let sqlString2 = "";
    const url = [];
    const values = [];
    for (const [key, giatri] of Object.entries(data)){
        if (key == "posts"){
            for (const [key, value] of Object.entries(giatri)){
                if(index >= 2){
                sqlString += `,`;
            };
            sqlString += `${key} = $${index}`;
            values.push(value);
            index++;
            };
        };
        
        if (key == "postLink"){
            for (const [key, value] of Object.entries(giatri)){
                console.log(key, value);
                if(index2 >= 2){
                sqlString2 += `,`;
            };
            sqlString2 += `${key} = $${index2}`;
            url.push(value);
            index2++;
            console.log(sqlString2);
            
            console.log(url);
            };
        };
    };

    try{
        await client.query(`BEGIN`);
        const post_id = await client.query(`UPDATE posts SET ${sqlString} WHERE deleted_at IS NULL AND id = $${index} RETURNING *`,[...values,id]);
        console.log(post_id.rows[0].id);
        const post_url = await client.query(`UPDATE post_links SET ${sqlString2} WHERE post_id = $${index2} RETURNING url`,[...url, post_id.rows[0].id]);
        console.log(url[0]);
        if(post_url.rowCount===0){
            await client.query(`INSERT INTO post_links (post_id, url) VALUES ($1,$2) RETURNING *`,[post_id.rows[0].id, url[0]]);
        }
        await client.query(`COMMIT`);
    }catch(error){
        await client.query("ROLLBACK");
        
        throw error;
    }finally{
        client.release();
    };
    
};*/

export const deletePostById = async (id) => {
    const result = await pool.query(
        `UPDATE posts
        SET deleted_at = NOW()
        WHERE id = $1
        RETURNING deleted_at
        `,
        [id]
    );
    return result.rows[0] ?? null;
}