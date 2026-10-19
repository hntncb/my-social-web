import { after, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../../app.js";
import pool from "../../database/pool.js";
import { generateAccessToken } from "../../utils/jwt.js";
import bcrypt from "bcrypt";

describe("comment integration test", () => {
    let user_token;
    let another_user_token;
    let admin_token;
    let user_id;
    let post_id;

    beforeEach(async () => {
        await pool.query(`TRUNCATE TABLE comments, posts, users, post_links RESTART IDENTITY CASCADE`);

        // Tạo user mẫu
        const password_hash = await bcrypt.hash("1", 10);
        const user = await pool.query(
            `INSERT INTO users (email, username, password_hash, role)
             VALUES ('user1@gmail.com', 'user1', $1, 'user')
             RETURNING *`,
            [password_hash]
        );
        user_id = user.rows[0].id;

        const anotherUser = await pool.query(
            `INSERT INTO users (email, username, password_hash, role)
             VALUES ('user2@gmail.com', 'user2', $1, 'user')
             RETURNING *`,
            [password_hash]
        );

        const admin = await pool.query(
            `INSERT INTO users (email, username, password_hash, role)
             VALUES ('admin@gmail.com', 'adminuser', $1, 'admin')
             RETURNING *`,
            [password_hash]
        );

        // Tạo bài viết mẫu
        const post = await pool.query(
            `INSERT INTO posts (title, content, author_id)
             VALUES ('Test Post', 'Content Post', $1)
             RETURNING *`,
            [user_id]
        );
        post_id = post.rows[0].id;

        user_token = generateAccessToken({ id: user_id, role: "user" });
        another_user_token = generateAccessToken({ id: anotherUser.rows[0].id, role: "user" });
        admin_token = generateAccessToken({ id: admin.rows[0].id, role: "admin" });
    });

    afterEach(async () => {
        await pool.query(`TRUNCATE TABLE comments, posts, users, post_links RESTART IDENTITY CASCADE`);
    });

    after(async () => {
        await pool.end();
    });

    describe("test create comment", () => {
        it("should return status 201 when create comment successfully", async () => {
            const response = await request(app)
                .post("/v1/comments")
                .set("Authorization", `Bearer ${user_token}`)
                .send({
                    user_id: user_id,
                    post_id: post_id,
                    parent_id: null,
                    content: "This is a test comment"
                })
                .expect(201);

            assert.strictEqual(response.body.content, "This is a test comment");
            assert.ok(response.body.id);
        });

        it("should return status 401 when not logged in", async () => {
            await request(app)
                .post("/v1/comments")
                .send({
                    user_id: user_id,
                    post_id: post_id,
                    content: "This is a test comment"
                })
                .expect(401);
        });
    });

    describe("test get comments", () => {
        beforeEach(async () => {
            await pool.query(
                `INSERT INTO comments (user_id, post_id, parent_id, content)
                 VALUES ($1, $2, NULL, 'First comment')`,
                [user_id, post_id]
            );
        });

        it("should return status 200 and list of all comments", async () => {
            const response = await request(app)
                .get("/v1/comments")
                .expect(200);

            assert.ok(Array.isArray(response.body));
            assert.strictEqual(response.body.length, 1);
        });

        it("should return status 200 and comments by post_id", async () => {
            const response = await request(app)
                .get(`/v1/comments/post/${post_id}`)
                .expect(200);

            assert.ok(Array.isArray(response.body));
            assert.strictEqual(response.body.length, 1);
            assert.strictEqual(response.body[0].content, "First comment");
        });
    });

    describe("test update comment", () => {
        let comment_id;

        beforeEach(async () => {
            const comment = await pool.query(
                `INSERT INTO comments (user_id, post_id, parent_id, content)
                 VALUES ($1, $2, NULL, 'Original content')
                 RETURNING *`,
                [user_id, post_id]
            );
            comment_id = comment.rows[0].id;
        });

        it("should return status 200 when owner updates comment", async () => {
            const response = await request(app)
                .patch(`/v1/comments/${comment_id}`)
                .set("Authorization", `Bearer ${user_token}`)
                .send({ content: "Updated content" })
                .expect(200);

            assert.strictEqual(response.body, true);
        });

        it("should return status 403 when non-owner tries to update", async () => {
            await request(app)
                .patch(`/v1/comments/${comment_id}`)
                .set("Authorization", `Bearer ${another_user_token}`)
                .send({ content: "Updated content" })
                .expect(403);
        });
    });

    describe("test delete comment", () => {
        let comment_id;

        beforeEach(async () => {
            const comment = await pool.query(
                `INSERT INTO comments (user_id, post_id, parent_id, content)
                 VALUES ($1, $2, NULL, 'To be deleted')
                 RETURNING *`,
                [user_id, post_id]
            );
            comment_id = comment.rows[0].id;
        });

        it("should return status 204 when admin deletes comment", async () => {
            await request(app)
                .delete(`/v1/comments/${comment_id}`)
                .set("Authorization", `Bearer ${admin_token}`)
                .expect(204);
        });

        it("should return status 401 when not logged in", async () => {
            await request(app)
                .delete(`/v1/comments/${comment_id}`)
                .expect(401);
        });
    });
});