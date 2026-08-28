import pool from "../../database/pool.js";

export const findByEmail = async (email) => {
    const result = await pool.query(
        `
        SELECT id, email, username
        FROM users
        WHERE email = $1 AND deleted_at IS NULL
        `,
    [email]
    );
    return result.rows[0] ?? null;
};

export const findByUsername = async (username) => {
    const result = await pool.query(
        `
        SELECT id, username
        FROM users
        WHERE username = $1 AND deleted_at IS NULL
        `,
    [username]
    );
    return result.rows[0] ?? null;
};

export const findByUsernamewithPassword = async (username) => {
    const result = await pool.query(
        `
        SELECT id, username,email,password_hash, role
        FROM users
        WHERE username = $1 
        AND deleted_at IS NULL
        `,
    [username]
    );
    return result.rows[0] ?? null;
};

export const findAll = async () => {
    const result = await pool.query(
        `
        SELECT id, email, username,password_hash, created_at, deleted_at
        FROM users
        ORDER BY created_at DESC 
        `
    );
    return result.rows;
};

export const findById = async (id) =>{
    const result = await pool.query(
        `
        SELECT id, email, username, deleted_at
        FROM users
        WHERE id = $1
        AND deleted_at IS NULL
        `,
        [id]
    );
    return result.rows[0] ?? null;
}

export const createUser = async ({email ,username, password_hash}) => {
    const result = await pool.query(
        `
        INSERT INTO users (email, username, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, username, created_at
        `,
        [email, username, password_hash]
    );
    return result.rows[0];
}

export const updateById = async (id ,data) => {
    const fields = [];
    const values = [];
    let index = 1;

    if (data.email!==undefined){
        fields.push(`email = $${index++}`);
        values.push(data.email);
    }

    if (data.username!==undefined){
        fields.push(`username = $${index++}`);
        values.push(data.username);
    }
    
    if (data.password_hash!==undefined){
        fields.push(`password_hash = $${index++}`);
        values.push(data.password_hash);
    }
    if (fields.length===0){
        return null;
    }
    values.push(id);

    const result = await pool.query(
        `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE id = $${index} AND deleted_at IS NULL
        RETURNING id ,email ,username, updated_at
        `,
        values
    );

    return result.rows[0] ?? null;

}

export const deleteById = async (id) => {
    const result = await pool.query(
        `
        UPDATE users
        SET deleted_at = NOW()
        WHERE id = $1
        `,
        [id]
    )
    return result.rows[0] ?? null;
}