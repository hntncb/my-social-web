import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import pool from "../../database/pool.js";
import { createPostWithUrl, createPost, getFirts10Posts } from "../../features/posts/post.repository.js";

describe("integration test post repository", () => {
    let author_id;

    before(async () =>{
        await pool.query(
            `TRUNCATE TABLE post_links, posts, users
            RESTART IDENTITY CASCADE;
        `)
    });

    beforeEach(async () =>{
        await pool.query(
            `TRUNCATE TABLE post_links, posts, users
            RESTART IDENTITY CASCADE;
        `)
        const user = await pool.query(
            `
            INSERT INTO users (email, username, password_hash)
            VALUES ('myemail@gmail.com','user1','3d1fd95341cb242cecba9e2d6d21c629')
            RETURNING *
            `
        );
        author_id = user.rows[0].id;
    });

    after(async () =>{
        await pool.query(
            `TRUNCATE TABLE post_links, posts, users
            RESTART IDENTITY CASCADE;
        `)
        await pool.end();
    });

    describe("test createPost", () =>{
        
        it('tra ve thong tin cua post duoc tao', async () => {
            const title = "bai viet cua toi";
            const content = "hi xin chao";
            const result = await createPost(title, content, author_id);

            assert.ok(result);
            assert.equal(result.title, title);
            assert.equal(result.content, content);
        });
    });
});