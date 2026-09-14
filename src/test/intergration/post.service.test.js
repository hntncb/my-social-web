import { after, beforeEach, describe,it } from "node:test";
import assert from "node:assert";

import {patchPostById} from "../../features/posts/post.services.js";
import * as repository from "../../features/posts/post.repository.js";
import pool from "../../database/pool.js";

describe("test posts services",() =>{
    let author_id;
    beforeEach(async()=>{
        const title = "bai viet 1";
        const content = "helo ca lo nha minh";
        await pool.query(
            `
            TRUNCATE TABLE posts, post_links
            RESTART IDENTITY CASCADE;
        `);

        let number = Date.now()

        const user = await pool.query(
            `
            INSERT INTO users (username, password_hash)
            VALUES ($1,'3d1fd95341cb242cecba9e2d6d21c629')
            RETURNING *
        `, [number]);

        author_id = user.rows[0].id;   
        
        await pool.query(
            `INSERT INTO posts (title, content, author_id)
            VALUES ($1, $2, $3);
        `,[title, content, author_id]
    );

    });        
    after(async ()=>{
        pool.query(
            `
            TRUNCATE TABLE posts, post_links
            RESTART IDENTITY CASCADE;
            `);
        await pool.end();
    });
    describe("test patchPostById",()=>{
        it("should return update succes",async()=>{
            const id = 1;
            const data = [{ title: 'baiviet 1', content: 'helo moi nguoi nha' }];
            const result = await patchPostById(id, data);

            assert.ok(result);
        });
        
    })
    
});