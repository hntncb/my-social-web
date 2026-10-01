import { after, beforeEach, describe, it } from "node:test";
import app from "../../app.js";
import request from "supertest";
import assert from "node:assert";
import pool from "../../database/pool.js";
//import redisClient from "../../database/redis.js";

describe("test auth integration", ()=>{

    beforeEach(async()=>{
        //làm sạch db
        await pool.query(
            `TRUNCATE TABLE post_links, posts, users
            RESTART IDENTITY CASCADE;
        `)
        //xoá dữ liệu redis
        //await redisClient.flushAll();
    });

    after(async()=>{
        await pool.end();
        //await redisClient.quit();
    });
    
    describe("test register",() => {
        //trường hợp thông trường
        it("should return code 201 when register success", async ()=>{
            
            const result = await request(app).post("/v1/auth/register")
            .send({username: "test_user", password: "test_password1"});
            
            assert.equal(result.status, 201);
        });
        //trường hợp username/password rỗng
        it("should return code 400 when username empty", async ()=>{
            
            const result = await request(app).post("/v1/auth/register")
            .send({username: "test_user", password: ""});
            
            assert.equal(result.status, 400);
        });
        //trường hợp username/password rỗng
        it("should return code 400 when password empty", async ()=>{
            
            const result = await request(app).post("/v1/auth/register")
            .send({username: "", password: "test_password1"});
            
            assert.equal(result.status, 400);
        });
        //trường hợp username đã tồn tại
        it("should return code 409 when username already exists", async ()=>{
            //đăng ký lần 1
            await request(app).post("/v1/auth/register")
            .send({username: "registed-user", password: "test_password1"});
            //đăng ký lần 2
            const result = await request(app).post("/v1/auth/register")
            .send({username: "registed-user", password: "test_password1"});
            
            assert.equal(result.status, 409);
        });
    });

    describe("test login",() => {
        // trường hợp thông thường
        it("should return code 200 when login", async ()=>{
            await request(app).post("/v1/auth/register")
            .send({username: "test_user", password: "test_password1"});
            
            const result = await request(app).post("/v1/auth/login")
            .send({username: "test_user", password: "test_password1"});
            
            assert.equal(result.status, 200);
            assert.ok(result.body.data.accessToken);
        });
        //trường hợp username/password rỗng 
        it("should return code 400 when username/password empty", async ()=>{
            
            const result = await request(app).post("/v1/auth/login")
            .send({username: "", password: ""});
            
            assert.equal(result.status, 400);
        });
        //trường hợp username/password sai
        it("should return code 401 when wrong user", async ()=>{
            await request(app).post("/v1/auth/register")
            .send({username: "existing-user", password: "test_password1"});
            
            const result = await request(app).post("/v1/auth/login")
            .send({username: "not-exist-user", password: "test_password1"});
            
            assert.equal(result.status, 401);
        });
    });
    
});