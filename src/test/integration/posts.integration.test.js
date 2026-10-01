import { after, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";
import pool from "../../database/pool.js";
import { generateAccessToken } from "../../utils/jwt.js";
import postRepository from "../../features/posts/post.repository.js";
//import redisClient from "../../database/redis.js";

describe("post integration test", () => {
    let user_token;
    let another_user_token;
    let admin_token;
    let author_id;

    beforeEach(async () => {
        await pool.query(`TRUNCATE TABLE users, posts, post_links RESTART IDENTITY CASCADE`);

        const user = await pool.query(
            `
            INSERT INTO users (email, username, password_hash)
            VALUES ('myemail@gmail.com','user1','$2a$10$IpRf2gAhE/ELPAd5uIAcL.MeqGptjxblwt1b8ffGTAa80W.sDeRTq')
            RETURNING *
            `
        );

        author_id = user.rows[0].id;
        // tạo 20 posts của user dummy
        const rows = 20;

        for (let i = 1; i <= rows; i++) {
            const createdAt = new Date(Date.now() + i * 1000);
            await pool.query(
                `INSERT INTO posts 
                (title, content, author_id, created_at)
                VALUES($1,$2,$3,$4)`,
                [`post ${i}`, "bai viet test", author_id, createdAt]
            );
        }

        user_token = generateAccessToken({ "id": 1, "role": "user" });
        admin_token = generateAccessToken({ "id": 2, "role": "admin" });
        another_user_token = generateAccessToken({ "id": 3, "role": "user" });
    });

    afterEach(async () => {
        await pool.query(`TRUNCATE TABLE users, posts, post_links RESTART IDENTITY CASCADE`);
    });

    after(async () => {
        await pool.query(`TRUNCATE TABLE users, posts, post_links RESTART IDENTITY CASCADE`);
    
        await pool.end();
        //await redisClient.quit();
    });
    
    describe("test create post", () => {
        // happy path
        it("should return status 201 when created post", async () => {
            const title = "title";
            const content = "example content";
            const url = "http://exampleurl.com";
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content, url })
                .expect(201);

            assert.equal(result.body.data.title, title);
            assert.equal(result.body.data.content, content);
            assert.equal(result.body.data.url, url);

            assert.ok(result.body.data.id);
            assert.ok(result.body.data.created_at);

            const post = await postRepository.findPostById(result.body.data.id);

            assert.ok(post);
            assert.equal(post.title, title);
            assert.equal(post.content, content);
        });

        // chỉ title
        it("should return status 400 when only title", async () => {
            const title = "title";
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title })
                .expect(400);

            assert.equal(result.body.message, 'title va content khong duoc de trong');
            assert.equal(result.body.success, false);
        });

        // chỉ content
        it("should return status 400 when only content", async () => {
            const content = "example content";
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({ content })
                .expect(400);

            assert.equal(result.body.message, 'title va content khong duoc de trong');
            assert.equal(result.body.success, false);
        });

        // chỉ url
        it("should return status 400 when only url", async () => {
            const url = "http://exampleurl.com";
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({ url })
                .expect(400);

            assert.equal(result.body.message, 'title va content khong duoc de trong');
            assert.equal(result.body.success, false);
        });

        // send({})
        it("should return status 400 when empty body", async () => {
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({})
                .expect(400);

            assert.equal(result.body.message, 'title va content khong duoc de trong');
            assert.equal(result.body.success, false);
        });

        // không đăng nhập
        it("should return status 401 when not logged in", async () => {
            const title = "title";
            const content = "example content";
            const url = "http://exampleurl.com";
            const result = await request(app)
                .post("/v1/posts")
                .send({ title, content, url })
                .expect(401);

            assert.equal(result.body.message, 'chua dang nhap');
        });

        // url sai form
        it("should return status 400 when invalid url format", async () => {
            const title = "title";
            const content = "example content";
            const url = "exampleurl.com";
            const result = await request(app)
                .post("/v1/posts")
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content, url })
                .expect(400);

            assert.equal(result.body.success, false);
            assert.equal(result.body.message, 'url phai co dang https:// hoac http://');
        });
    });

    describe("test getPostsWithOffset", async () => {
        // happy path
        it("should return status 200", async () => {
            const limit = 10;
            const offset = 0;

            const result = await request(app)
                .get("/v1/posts/pages")
                .query({ limit, offset })
                .expect(200);
        });

        // truyền tham số rỗng
        it("should return status 400 when empty parameters", async () => {
            const limit = "";
            const offset = "";

            const result = await request(app)
                .get("/v1/posts/pages")
                .query({ limit, offset })
                .expect(400);

            assert.equal(result.body.success, false);
            assert.equal(result.body.message, 'limit khong duoc de trong');
        });

        // chỉ truyền offset
        it("should return status 400 when missing limit", async () => {
            const offset = "0";

            const result = await request(app)
                .get("/v1/posts/pages")
                .query({ offset })
                .expect(400);

            assert.equal(result.body.success, false);
            assert.equal(result.body.message, 'limit khong duoc de trong');
        });

        // offset không tồn tại
        it("should return status 200 when offset too big", async () => {
            const limit = "10";
            const offset = "9999999999";

            const result = await request(app)
                .get("/v1/posts/pages")
                .query({ limit, offset })
                .expect(200);
        });

        // tham số âm
        it("should return status 400 when negative limit", async () => {
            const limit = "-10";
            const offset = "0";

            const result = await request(app)
                .get("/v1/posts/pages")
                .query({ limit, offset })
                .expect(400);

            assert.equal(result.body.success, false);
            assert.equal(result.body.message, 'limit khong hop le hoac bi thieu');
        });
    });

    describe("test getPostWithCursor", async () => {
        // happy path
        it("should return status 200", async () => {
            const post_id = "0";
            const limit = "10";

            const result = await request(app)
                .get("/v1/posts")
                .query({ post_id, limit })
                .expect(200);

            assert.equal(result.status, 200);
        });

        // tham số rỗng
        it("should return status 400 when empty parameters", async () => {
            const post_id = "";
            const limit = "";

            const result = await request(app)
                .get("/v1/posts")
                .query({ post_id, limit })
                .expect(400);

            assert.equal(result.body.success, false);
        });

        // chỉ truyền post_id
        it("should return status 200 when only post_id", async () => {
            const post_id = "0";
            const limit = "10";

            const result = await request(app)
                .get("/v1/posts")
                .query({ post_id, limit })
                .expect(200);

            assert.equal(result.status, 200);
        });

        // post_id không tồn tại
        it("should return status 200 when post_id too big", async () => {
            const post_id = "9999999999";
            const limit = "10";

            const result = await request(app)
                .get("/v1/posts")
                .query({ post_id, limit })
                .expect(200);

            assert.equal(result.status, 200);
        });

        // tham số âm
        it("should return status 400 when negative limit", async () => {
            const post_id = "0";
            const limit = "-10";

            const result = await request(app)
                .get("/v1/posts")
                .query({ post_id, limit })
                .expect(400);

            assert.equal(result.body.success, false);
        });
    });

    describe("test getPostById", async () => {
        // happy path
        it("should return status 200", async () => {
            const id = "1";
            const result = await request(app)
                .get(`/v1/posts/${id}`)
                .expect(200);

            assert.equal(result.status, 200);
        });

        // không id
        it("should return status 400 when no id", async () => {
            const id = "";

            const result = await request(app)
                .get(`/v1/posts/${id}`)
                .expect(400);

            assert.equal(result.body.success, false);
        });

        // id âm
        it("should return status 400 when negative id", async () => {
            const id = "-1";
            const result = await request(app)
                .get(`/v1/posts/${id}`)
                .expect(400);

            assert.equal(result.body.success, false);
        });
    });

    describe("test patchPostById", () => {
        // happy path
        it("should return status 200 when update", async () => {
            const post_id = "1";
            const title = "bai viet 1";
            const content = "aaaaaa";
            const url = "http://google@gmail.com";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content, url })
                .expect(200);

            assert.equal(result.status, 200);
            assert.deepStrictEqual(result.body.data.id, post_id);
        });

        // happy path không url
        it("should return status 200 when update without url", async () => {
            const post_id = "1";
            const title = "bai viet 1";
            const content = "aaaaaa";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content })
                .expect(200);

            assert.equal(result.status, 200);
            assert.deepStrictEqual(result.body.data.id, post_id);
        });

        // khong id
        it("should return status 404 when no post_id", async () => {
            const post_id = "";
            const title = "bai viet 1";
            const content = "aaaaaa";
            const url = "http://google@gmail.com";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content, url })
                .expect(404);

            assert.equal(result.body.success, false);
        });

        // id âm = không tồn tại
        it("should return status 404 when minus post_id", async () => {
            const post_id = "-100";
            const title = "bai viet 1";
            const content = "aaaaaa";
            const url = "http://google@gmail.com";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .send({ title, content, url })
                .expect(404);
        });

        // không phải chủ bài
        it("should return status 403 when non-owner user", async () => {
            const post_id = "1";
            const title = "bai viet 1";
            const content = "aaaaaa";
            const url = "http://google@gmail.com";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .set("Authorization", `Bearer ${another_user_token}`)
                .send({ title, content, url })
                .expect(403);
        });

        // không đăng nhập
        it("should return status 401 when not logged in", async () => {
            const post_id = "1";
            const title = "bai viet 1";
            const content = "aaaaaa";
            const url = "http://google@gmail.com";

            const result = await request(app)
                .patch(`/v1/posts/${post_id}`)
                .send({ title, content, url })
                .expect(401);
        });
    });

    describe("test deletePostById", () => {
        // happy path
        it("should return status 200", async () => {
            const id = 1;
            const result = await request(app)
                .delete(`/v1/posts/${id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .expect(200);

            assert.equal(result.status, 200);
        });

        // không truyền id
        it("should return status 400 when invalid id", async () => {
            const id = {};
            const result = await request(app)
                .delete(`/v1/posts/${id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .expect(404);
        });

        // truyền id bài viết không tồn tại
        it("should return status 404 when post_id not found", async () => {
            const id = 999999999;
            const result = await request(app)
                .delete(`/v1/posts/${id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .expect(404);
        });

        // không phải chủ bài
        it("should return status 403 when non-owner user", async () => {
            const id = 1;
            const result = await request(app)
                .delete(`/v1/posts/${id}`)
                .set("Authorization", `Bearer ${another_user_token}`)
                .expect(403);
        });
    });
});