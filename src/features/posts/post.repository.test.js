import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import pool from "../../database/pool.js";
import { createPostWithUrl } from "../posts/post.repository.js";

let testUserId;
let createdPostId;

before(async () => {
    await pool.query("TRUNCATE TABLE post_links, posts, users RESTART IDENTITY CASCADE");
    // 1. Tạo một User dummy để làm tác giả bài viết
    const userRes = await pool.query(
        `INSERT INTO users (username, password_hash) 
         VALUES ($1, $2) 
         RETURNING id`,
        ["user5", "password123"]
    );
    testUserId = userRes.rows[0].id;
});

test("createPostWithUrl", async () => {
    // 2. Truyền ID của user thật vừa tạo vào hàm
    const result = await createPostWithUrl(
        "Test post",
        "Test content",
        testUserId,
        "https://example.com"
    );

    assert.ok(result);
    assert.strictEqual(result.title, "Test post");
    
    // Lưu lại ID post để dùng cho việc cleanup
    createdPostId = result.id; 
});

after(async () => {
    try {
        // 1. Xóa bảng phụ (post_links) chứa khóa ngoại trỏ tới posts
        if (createdPostId) {
            await pool.query("DELETE FROM post_links WHERE post_id = $1", [createdPostId]).catch(() => {});
        }
        
        // 2. Xóa bảng chính (posts)
        if (createdPostId) {
            await pool.query("DELETE FROM posts WHERE id = $1", [createdPostId]).catch(() => {});
        }

        // 3. Xóa user mẫu
        if (testUserId) {
            await pool.query("DELETE FROM users WHERE id = $1", [testUserId]).catch(() => {});
        }
    } catch (err) {
        console.error("Lỗi khi dọn dẹp test database:", err);
    } finally {
        // Luôn ngắt kết nối database
        await pool.end();
    }
});