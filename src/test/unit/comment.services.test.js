import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import * as commentServices from "../../features/comment/comment.services.js";
import commentRepository from "../../features/comment/comment.repository.js";

describe("test comment services", () => {
    let mockComments;

    beforeEach(() => {
        mockComments = [
            {
                id: 1,
                user_id: 1,
                post_id: 1,
                parent_id: null,
                content: "test comment 1",
                created_at: "2024-01-15T08:30:00Z",
                deleted_at: null
            },
            {
                id: 2,
                user_id: 2,
                post_id: 1,
                parent_id: 1,
                content: "test reply 1",
                created_at: "2024-01-15T09:30:00Z",
                deleted_at: null
            }
        ];
    });

    afterEach(() => {
        mock.restoreAll();
    });

    describe("test getAll", () => {
        it("should return all comments", async () => {
            mock.method(commentRepository, "findAll", async () => mockComments);

            const result = await commentServices.getAll();
            assert.deepStrictEqual(result, mockComments);
        });

        it("should throw 404 error when no comments found", async () => {
            mock.method(commentRepository, "findAll", async () => null);

            const result = await commentServices.getAll();
            assert.deepStrictEqual(result, []);
        });
    });

    describe("test getByPostId", () => {
        it("should return comments by post id", async () => {
            const postId = 1;
            mock.method(commentRepository, "findByPostId", async () => [mockComments[0]]);

            const result = await commentServices.getByPostId(postId);
            assert.deepStrictEqual(result, [mockComments[0]]);
        });

        it("should throw 404 error when comments by post id not found", async () => {
            const postId = 999;
            mock.method(commentRepository, "findByPostId", async () => null);

            const result = await commentServices.getByPostId(999);
            assert.deepStrictEqual(result, []);
        });
    });

    describe("test getReply", () => {
        it("should return replies by parent id", async () => {
            const parentId = 1;
            mock.method(commentRepository, "findReply", async () => [mockComments[1]]);

            const result = await commentServices.getReply(parentId);
            assert.deepStrictEqual(result, [mockComments[1]]);
        });

        it("should throw 404 error when replies not found", async () => {
            const parentId = 999;
            mock.method(commentRepository, "findReply", async () => null);

            await assert.rejects(async () => {
                await commentServices.getReply(parentId);
            }, (error) => {
                assert.strictEqual(error.message, "khong co comment");
                assert.strictEqual(error.statusCode, 404);
                return true;
            });
        });
    });

    describe("test create", () => {
        it("should return created comment", async () => {
            const input = { user_id: 1, post_id: 1, parent_id: null, content: "new comment" };
            const newComment = { id: 3, ...input };
            mock.method(commentRepository, "create", async () => newComment);

            const result = await commentServices.create(input);
            assert.deepStrictEqual(result, newComment);
        });

        it("should throw 404 error when create fails", async () => {
            const input = { user_id: 1, post_id: 1, parent_id: null, content: "new comment" };
            mock.method(commentRepository, "create", async () => null);

            await assert.rejects(async () => {
                await commentServices.create(input);
            }, (error) => {
                assert.strictEqual(error.message, "khong co comment");
                assert.strictEqual(error.statusCode, 404);
                return true;
            });
        });
    });

    describe("test update", () => {
        it("should return updated result", async () => {
            const id = 1;
            const content = "updated content";
            mock.method(commentRepository, "update", async () => true);

            const result = await commentServices.update(id, content);
            assert.strictEqual(result, true);
        });

        it("should throw 404 error when update fails", async () => {
            const id = 1;
            const content = "updated content";
            mock.method(commentRepository, "update", async () => false);

            await assert.rejects(async () => {
                await commentServices.update(id, content);
            }, (error) => {
                assert.strictEqual(error.message, "khong co comment");
                assert.strictEqual(error.statusCode, 404);
                return true;
            });
        });
    });

    describe("test deleteById", () => {
        it("should return deleted result", async () => {
            const id = 1;
            mock.method(commentRepository, "deleteById", async () => true);

            const result = await commentServices.deleteById(id);
            assert.strictEqual(result, true);
        });

        it("should throw 404 error when delete fails", async () => {
            const id = 999;
            mock.method(commentRepository, "deleteById", async () => false);

            await assert.rejects(async () => {
                await commentServices.deleteById(id);
            }, (error) => {
                assert.strictEqual(error.message, "khong co comment");
                assert.strictEqual(error.statusCode, 404);
                return true;
            });
        });
    });
});