import pool from "../../database/pool.js"

export const findAll = async() => {
    const {rows} = await pool.query(`
        SELECT * FROM comments
        WHERE deleted_at IS NULL`
    )
    return rows;
}
export const findById = async (id) => {
    const { rows } = await pool.query(
        `SELECT * FROM comments 
        WHERE id = $1 
        AND deleted_at IS NULL`, 
        [Number(id)]
    );
    return rows[0] ?? null;
};
export const findByPostId = async(post_id) => {
    const {rows} = await pool.query(`
        SELECT 
            c.id, 
            c.content, 
            c.created_at,
            u.id AS user_id,
            u.username AS user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1 AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC`,
        [post_id]
    )
    return rows;
}
export const findReply = async(parent_id) => {
    const {rows} = await pool.query(`
        SELECT 
            c.id, 
            c.content, 
            c.created_at,
            u.id AS user_id,
            u.username AS user_name
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.parent_id = $1 AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC`,
        [parent_id]
    )
    return rows;
}
export const create = async(input) => {
    const {rows} = await pool.query(`
        INSERT INTO comments (user_id,post_id, parent_id, content)
        VALUES ($1,$2,$3,$4)
        RETURNING *`
    ,[input.user_id,input.post_id, input.parent_id, input.content])
    return rows[0];
}
export const update = async(id, content) => {
    const {rowCount} = await pool.query(`
        UPDATE comments SET
            content = $2,
            updated_at = NOW()
        WHERE id = $1
        AND deleted_at IS NULL`
    ,[id, content])
    return (rowCount ?? 0) > 0;
}
export const deleteById = async(id) => {
    const {rowCount} = await pool.query(`
        UPDATE comments
        SET deleted_at = NOW()
        WHERE id = $1`,
        [id]
    )
    return (rowCount ?? 0) > 0;;
}

const commentRepository = {findAll,findById, findByPostId,findReply,create,update,deleteById};

export default commentRepository;