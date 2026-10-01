import { before, beforeEach, after, describe, it } from "node:test";
import assert from "node:assert";
import request from "supertest";
import pool from "../../database/pool.js";
//import redisClient from "../../database/redis.js";
import { generateAccessToken } from "../../utils/jwt.js";
import app from "../../app.js";
import bcrypt from "bcrypt";

describe("integeation test user",() => {
    let user_token;
    let admin_token;
    let another_user_token;

    beforeEach(async()=>{
        await pool.query(`TRUNCATE TABLE posts, users, post_links RESTART IDENTITY CASCADE`);

        //tạo 20 dummy user
        const rows = 20;
        const password = "1";
        const password_hash = await bcrypt.hash(password,10);
        for (let i = 1; i <= rows; i++) {
            const createdAt = new Date(Date.now() + i * 1000);
            const sqlreq = await pool.query(
            `INSERT INTO users (email, username, password_hash, created_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [`example${i}@mail.com`, `user${i}`,password_hash, createdAt]
            );
        }
        user_token = generateAccessToken({"id":1, "role":"user"});
        admin_token = generateAccessToken({"id":2, "role":"admin"});
        another_user_token = generateAccessToken({"id":3, "role":"user"});
    });

    after(async()=>{
        await pool.query(`TRUNCATE TABLE posts, users, post_links RESTART IDENTITY CASCADE`);
        await pool.end();
    });

    describe("test getAll",()=> {
        //happy path
        it("should return status 200 and token",async() =>{
            const result = await request(app)
            .get("/v1/users")
            .set("Authorization",`Bearer ${admin_token}`)
            .expect(200);

            assert.strictEqual(result.body.data.length, 20);
        });
        //test với role user
        it("should return status 403 when non-admin user",async() =>{
            const result = await request(app)
            .get("/v1/users")
            .set("Authorization",`Bearer ${user_token}`)
            .expect(403);
        });
        //test với không đăng nhập
        it("should return status 403",async() =>{
            const result = await request(app)
            .get("/v1/users")
            .expect(401);
        });
    });
    describe("test getById",()=> {
        //happy path
        it("should return status 200",async() =>{
            const id = "1";
            const result = await request(app)
            .get(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .expect(200);

            assert.strictEqual(typeof result.body.data, "object");
            assert.ok(result.body.data !== null);
            assert.strictEqual(Number(result.body.data.id), 1);
        });
        //id ngoài biên
        it("should return status 403",async() =>{
            const id = "99999999999";
            const result = await request(app)
            .get(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .expect(404);
        });
        //user_token
        it("should return status 403 when non-admin user",async() =>{
            const id = "1";
            const result = await request(app)
            .get(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${user_token}`)
            .expect(403);
        });
        //không đăng nhập
        it("should return status 403 when not logged in",async() =>{
            const id = "1";
            const result = await request(app)
            .get(`/v1/users/${id}`)
            .expect(401);
        });
    }); 
    describe("test patchById",()=> {
        //happy path
        it("should return status 200 when update",async() =>{
            const id = "2";
            const email = "myemail@email.com";
            const username = "edit_username";
            const password = "2";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .send({email, username, password})
            .expect(200);
        });
        //sửa email và username
        it("should return status 200 when update email and username",async() =>{
            const id = "2";
            const email = "myemail@email.com";
            const username = "edit_username";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .send({email, username})
            .expect(200);
        });
        //sửa pass
        it("should return status 200 when update password",async() =>{
            const id = "2";
            const password = "edited_password";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .send({password})
            .expect(200);
        });
        //sai id
        it("should return status 404 when too big id",async() =>{
            const id = "999999999999999999";
            const email = "myemail@email.com";
            const username = "edit_username";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .send({email, username})
            .expect(404);
        });
        //không phải chủ acc
        it("should return status 403 when owned user",async() =>{
            const id = "1";
            const email = "myemail@email.com";
            const username = "edit_username";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .send({email, username})
            .expect(200);
        });
        //không đăng nhập
        it("should return status 403 when not logged in",async() =>{
            const id = "unvalid_id";
            const email = "myemail@email.com";
            const username = "edit_username";
            const password = "2";
            const result = await request(app)
            .patch(`/v1/users/${id}`)
            .send({email, username, password})
            .expect(401);
        });
    });
    describe("test deleteById",()=> {
        //happy
        it("tesst",async() =>{
            const id = "1";
            const result = await request(app)
            .delete(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .expect(200);
        });
        //sai id
        it("tesst",async() =>{
            const id = "99999999999999";
            const result = await request(app)
            .delete(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${admin_token}`)
            .expect(404);

            assert.equal(result.status, 404);
        });
        //khong phai admin
        it("should return status 403 when non-admin user",async() =>{
            const id = "1";
            const result = await request(app)
            .delete(`/v1/users/${id}`)
            .set("Authorization",`Bearer ${user_token}`)
            .expect(403);

            assert.equal(result.status, 403);
        });
        //khong dang nhap
        it("when not logged in",async() =>{
            const id = "1";
            const result = await request(app)
            .delete(`/v1/users/${id}`)
            .expect(401);

            assert.equal(result.status, 401);
        });
    }); 
});