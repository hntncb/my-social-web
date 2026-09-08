import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import pool from "../../database/pool.js";
import { createPostWithUrl, createPost, findPostsWithOffset, findPostsWithCursor } from "../../features/posts/post.repository.js";

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

        const rows = 20

        for (let i = 1; i <= rows; i++) {
            const createdAt = new Date(Date.now() + i * 1000);
            await pool.query(
            `INSERT INTO posts 
            (title, content, author_id, created_at)
            VALUES($1,$2,$3,$4)`,
            [`post ${i}`, "bai viet test",author_id, createdAt]
            );
        }
    });

    after(async () =>{
        await pool.query(
            `TRUNCATE TABLE post_links, posts, users
            RESTART IDENTITY CASCADE;
        `)
        await pool.end();
    });

    describe("test createPost", () =>{
        
        it('return post created infomation', async () => {
            const title = "bai viet cua toi";
            const content = "hi xin chao";
            const result = await createPost(title, content, author_id);

            assert.ok(result);
            assert.equal(result.title, title);
            assert.equal(result.content, content);
        });
    });

    describe("test createPostWithUrl with URL", () =>{
        it('return post created infomation with URL', async () => {
            const title = "bai viet cua toi";
            const content = "hi xin chao";
            const url = ["https://google.com", "https://facebook.com"]
            const result = await createPostWithUrl(title, content, author_id, url);

            assert.ok(result);
            assert.equal(result.title, title);
            assert.equal(result.content, content);
            assert.deepStrictEqual(result.url, url);
        });
    });

    describe("test findPostsWithOffset", () => {
        it("should return a page with firts 10 post for page 1", async() =>{
            const limit = 10;
            const offset = 0;

            const result = await findPostsWithOffset(limit, offset);
            //kiểm tra có kết quả hợp lệ hay không
            assert.ok(result);
            //kiểm tra có số bản ghi được trả về có bằng limit hay không
            assert.deepStrictEqual(result.length, limit);
        });
        it("should return a page with next 10 post for page 2", async() =>{
            const limit = 10;
            const offsetPage1 = 0;
            const offsetPage2 = limit;
            
            const resultPage1 = await findPostsWithOffset(limit, offsetPage1);
            const resultPage2 = await findPostsWithOffset(limit, offsetPage2);
            //số lượng bài trả về có bằng limit không
            assert.deepStrictEqual(resultPage2.length, limit);
            //page 1 khác page 2 : id khác nhau và created_at của page 1 < page 2
            for(let i=0;i<limit;i++){
                assert.notDeepStrictEqual(resultPage1[i].id, resultPage2[i].id);
            }

            assert.ok(resultPage1[limit - 1].created_at.getTime() < resultPage2[0].created_at.getTime());
            assert.ok(resultPage1);
            assert.ok(resultPage2);
            
        });
        it("should return an empty array when offset exeeds total record count", async() => {
            const limit = 10;
            const offset = 20;

            const result = await findPostsWithOffset(limit, offset);
            
            assert.ok(result);
            assert.deepStrictEqual(result.length, 0);
        });
    });

});