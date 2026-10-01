import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import postRepository from "../../features/posts/post.repository.js";
import postServices from "../../features/posts/post.services.js";
import transactionModule from "../../database/transaction.js";

describe("test post service", () => {
    let mockPosts;

    beforeEach(() => {
        function generateMockPosts({
            count = 10,
            startTime = '2024-08-12T03:21:45.123Z',
            stepMs = 1000,
            authorId = 1,
            title = 'post_title',
            content = 'post content',
            url = 'https://gooogle.com',
        } = {}) {
            const startMs = new Date(startTime).getTime();
            const posts = [];

            for (let i = 1; i <= count; i++) {
                const createdAt = new Date(startMs + (i - 1) * stepMs).toISOString();

                posts.push({
                id: i,
                title,
                content,
                url,
                author_id: authorId,
                created_at: createdAt,
                updated_at: createdAt,
                edited_at: null,
                deleted_at: null,
                });
            }

            return posts;
        }
        mockPosts = generateMockPosts();
        
    });

    afterEach(() => {
        mock.restoreAll();
    });

    describe("test getPostsWithOffset", () => {
        // trường hợp thông thường
        it("should return posts from repository", async () => {
            const limit = 10;
            const offset = 0;

            const mockRepoFindOffset = mock.method(postRepository, "findPostsWithOffset",
                async () => {
                
                return mockPosts;
            });
            
            const result = await postServices.getPostsWithOffset(limit, offset);
            
            assert.deepStrictEqual(result, mockPosts);
            assert.equal(mockRepoFindOffset.mock.callCount(), 1);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[0], limit);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[1], offset);
        });
        // trường hợp trả về array trống
        it("should return empty array when repository returns empty array", async () => {
            const limit = 10;
            const offset = 0;

            const mockRepoFindOffset = mock.method(postRepository, "findPostsWithOffset",
                async () => []
            );
            
            const result = await postServices.getPostsWithOffset(limit, offset);

            assert.deepStrictEqual(result, []);

            assert.equal(mockRepoFindOffset.mock.callCount(), 1);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[0], limit);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[1], offset);
        });
        // trường hợp throw error
        it("should propagate repository error", async () => {
            const error = new Error("database error");
            const limit = 10;
            const offset = 0;

            const mockRepoFindOffset = mock.method(postRepository, "findPostsWithOffset", 
                async () => {
                    throw error;
                }
            );
            
            await assert.rejects(async()=>{
                await postServices.getPostsWithOffset(10, 0);
            },(error)=>{
                assert.equal(error.message,'database error');
                return true;
            });

            assert.equal(mockRepoFindOffset.mock.callCount(), 1);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[0], limit);
            assert.equal(mockRepoFindOffset.mock.calls[0].arguments[1], offset);
        });
    });

    describe("test getPostWithCursor", () => {
        // trường hợp thông thường
        it("should return posts from repository", async () => {
            const post_id = 0;
            const limit = 10;
            const mockRepoFindCursor = mock.method(postRepository, "findPostsWithCursor",
                async () => {
                
                return mockPosts;
            });
            
            const result = await postServices.getPostWithCursor(post_id, limit);

            assert.deepStrictEqual(result, mockPosts);
            assert.equal(mockRepoFindCursor.mock.callCount(), 1);
            assert.equal(mockRepoFindCursor.mock.calls[0].arguments[0], post_id);
            assert.equal(mockRepoFindCursor.mock.calls[0].arguments[1], limit);
        });
        // trường hợp trả về []
        it("should return empty array when repository returns []", async () => {
            const post_id = 0;
            const limit = 10;
            const mockRepoFindCursor = mock.method(postRepository, "findPostsWithCursor",
                async () => {return []}
            );
            
            const result = await postServices.getPostWithCursor(post_id, limit);

            assert.deepStrictEqual(result, []);
            assert.equal(mockRepoFindCursor.mock.callCount(), 1);
            assert.equal(mockRepoFindCursor.mock.calls[0].arguments[0], post_id);
            assert.equal(mockRepoFindCursor.mock.calls[0].arguments[1], limit);
        });
        // trường hợp throw error
        it("should propagate repository error", async () => {
            const error = new Error("database error");
            const post_id = 0;
            const limit = 10;

            const mockRepoFindCursor = mock.method(postRepository, "findPostsWithCursor", 
                async () => {
                    throw error;
                }
            );
            
            await assert.rejects(async()=>{
                await postServices.getPostWithCursor(post_id, limit);
                },(error)=>{
                    assert.equal(error.message, 'database error');
                    return true;
                });

                assert.equal(mockRepoFindCursor.mock.callCount(), 1);
                assert.equal(mockRepoFindCursor.mock.calls[0].arguments[0], post_id);
                assert.equal(mockRepoFindCursor.mock.calls[0].arguments[1], limit);
            });
        });

    describe("test getPostById", () => {
        //các trường hợp bình thường
        it("should return post from repository", async () => {
            const id = 1;
            const expectedPost = mockPosts[0];
            const mockRepoFindById = mock.method(
                postRepository,
                "findPostById",
                async () => {
                return expectedPost;
            });
            
            const result = await postServices.getPostById(id);

            assert.deepStrictEqual(result, expectedPost);
            assert.equal(mockRepoFindById.mock.callCount(),1);
            assert.equal(mockRepoFindById.mock.calls[0].arguments, id);
        });
        //, trả [], 

        it("should return []", async () => {
            const id = 1;
            
            const mockRepoFindById = mock.method(
                postRepository,
                "findPostById",
                async () => {
                return [];
            });
            
            const result = await postServices.getPostById(id);

            assert.deepStrictEqual(result, []);
            assert.equal(mockRepoFindById.mock.callCount(),1);
            assert.equal(mockRepoFindById.mock.calls[0].arguments, id);
        });
        // trả error
        it("should return error", async () => {
            const id = 100;
            const error = new Error("database error");
            
            const mockRepoFindById = mock.method(
                postRepository,
                "findPostById",
                async () => {
                throw error;
            });
            
            await assert.rejects(async()=>{
                await postServices.getPostById(id);
            },(error)=>{
                assert.equal(error.message, 'database error');
                return true;
            });

            assert.equal(mockRepoFindById.mock.callCount(),1);
            assert.equal(mockRepoFindById.mock.calls[0].arguments, id);
        });
        //404
        it("should return status 404", async () => {
            const id = 1;
            
            const mockRepoFindById =  mock.method(
                postRepository,
                "findPostById",
                async () => {
                return null;
            });
            
            await assert.rejects(async()=>{
                await postServices.getPostById(id);
            }, (error) => {
                assert.equal(error.message, 'bai viet khong ton tai');
                assert.equal(error.status, 404);
                return true;
            });
            
            assert.equal(mockRepoFindById.mock.callCount(),1);
            assert.equal(mockRepoFindById.mock.calls[0].arguments[0], id);
        });
    });

    describe("test createPost", () => {
        it("should return post created with url", async () => {
            const title = "example title";
            const content = "example content";
            const author_id = "1";
            const url = "facebook.com";

            const expectedPost = { title, content, author_id, url };

            const createPostMock = mock.method(
                postRepository, 
                "createPostWithUrl", 
                async () => expectedPost
            );

            const result = await postServices.createPost({title, content, author_id, url});

            assert.equal(createPostMock.mock.callCount(), 1);

            assert.deepStrictEqual(createPostMock.mock.calls[0].arguments, [
                title, 
                content, 
                author_id, 
                url
            ]);

            assert.deepStrictEqual(result, expectedPost);
        });

        it("should return post created without url", async () => {
            const title = "example title";
            const content = "example content";
            const author_id = "1";

            const expectedPost = { title, content, author_id };

            const createPostMock = mock.method(
                postRepository, 
                "createPost", 
                async () => expectedPost
            );

            const result = await postServices.createPost({title, content, author_id});

            assert.equal(createPostMock.mock.callCount(), 1);

            assert.deepStrictEqual(createPostMock.mock.calls[0].arguments, [
                title, 
                content, 
                author_id
            ]);

            assert.deepStrictEqual(result, expectedPost);
        });
    });

    it("should return []", async () => {
        const title = "example title";
        const content = "example content";
        const author_id = "";
        const url = "facebook.com";

        const createPostMock = mock.method(
            postRepository, 
            "createPostWithUrl", 
            async () =>{ return []}
        );

        const result = await postServices.createPost({title, content, author_id, url});

        assert.equal(createPostMock.mock.callCount(), 1);

        assert.deepStrictEqual(createPostMock.mock.calls[0].arguments, [
                title, 
                content, 
                author_id,
                url
            ]);

        assert.deepStrictEqual(result, []);
    });

    it("should return error", async () => {
            const title = "example title";
            const content = "example content";
            const author_id = "";
            const url = "facebook.com";
            const error = new Error("database error");

            const createPostMock = mock.method(
                postRepository, 
                "createPostWithUrl", 
                async () => {throw error}
            );

            await assert.rejects(async()=>{
                await postServices.createPost({title, content, author_id, url});
            },(error)=>{
                assert.equal(error.message,'database error');
                return true;
            });

            assert.equal(createPostMock.mock.callCount(), 1);

            assert.deepStrictEqual(createPostMock.mock.calls[0].arguments, [
                title, 
                content, 
                author_id,
                url
            ]);

        });

    describe("test patchPostById", () => {
        it("should return updated post with url", async () => {
            const id = 10;
            const data = {
                title: "example title",
                content: "example content",
                url: "https://helloworl.com"
            };

            const postData = {
                title: "example title",
                content: "example content"
            };

            const postLinkData = {
                url: "https://helloworl.com"
            };

            const findRepoPost = mock.method(postRepository, "findPostById", async (postId) => {
                return { id: postId, title: "old title", content: "old content" };
            });

            const clientMock = mock.method(transactionModule, "transaction", async (callback) => {
                const fakeClient = {};
                return await callback(fakeClient);
            });

            const mockRepoUpdate = mock.method(postRepository, "updatePostById", async (client, postId, pData) => {
                return {
                    title: pData.title,
                    content: pData.content
                };
            });

            const mockRepoUpsert = mock.method(postRepository, "upsertPostLink", async (client, postId, lData) => {
                return {
                    url: lData.url
                };
            });

            const result = await postServices.patchPostById(id, data);

            assert.strictEqual(findRepoPost.mock.calls[0].arguments[0], id);

            assert.deepStrictEqual(mockRepoUpdate.mock.calls[0].arguments[2], postData);

            assert.deepStrictEqual(mockRepoUpsert.mock.calls[0].arguments[2], postLinkData);

            assert.deepStrictEqual(result, data);
        });

        it("should return updated post withot url", async () => {
            const id = 10;
            const data = {
                title: "example title",
                content: "example content"
            };

            const postData = {
                title: "example title",
                content: "example content"
            };

            const findRepoPost = mock.method(postRepository, "findPostById", async (postId) => {
                return { id: postId, title: "old title", content: "old content" };
            });

            const clientMock = mock.method(transactionModule, "transaction", async (callback) => {
                const fakeClient = {};
                return await callback(fakeClient);
            });

            const mockRepoUpdate = mock.method(postRepository, "updatePostById", async (client, postId, pData) => {
                return {
                    title: pData.title,
                    content: pData.content
                };
            });

            const result = await postServices.patchPostById(id, data);

            assert.strictEqual(findRepoPost.mock.calls[0].arguments[0], id);

            assert.deepStrictEqual(mockRepoUpdate.mock.calls[0].arguments[2], postData);

            assert.deepStrictEqual(result, data);
        });

        it("should return error", async () => {
            const id = 10;
            const error = new Error("database error");
            const data = {
                title: "example title",
                content: "example content",
                url: "https://helloworl.com"
            };

            const postData = {
                title: "example title",
                content: "example content"
            };

            const postLinkData = {
                url: "https://helloworl.com"
            };

            const findRepoPost = mock.method(postRepository, "findPostById", async (postId) => {
                return { id: postId, title: "old title", content: "old content" };
            });

            const clientMock = mock.method(transactionModule, "transaction", async (callback) => {
                const fakeClient = {};
                return await callback(fakeClient);
            });

            const mockRepoUpdate = mock.method(postRepository, "updatePostById", async (client, postId, pData) => {
                return {
                    title: pData.title,
                    content: pData.content
                };
            });

            const mockRepoUpsert = mock.method(postRepository, "upsertPostLink", async (client, postId, lData) => {
                throw error
            });

            await assert.rejects(async()=>{
                await postServices.patchPostById(id, data);
            }, (error) => {
                assert.equal(error.message, 'database error');
                return true;
            });

            assert.strictEqual(findRepoPost.mock.calls[0].arguments[0], id);

            assert.deepStrictEqual(mockRepoUpdate.mock.calls[0].arguments[2], postData);

            assert.deepStrictEqual(mockRepoUpsert.mock.calls[0].arguments[2], postLinkData);
        });

        it("should return status 404", async () => {
            const id = 10;
            const data = {
                title: "example title",
                content: "example content",
                url: "https://helloworl.com"
            };

            const postData = {
                title: "example title",
                content: "example content"
            };

            const postLinkData = {
                url: "https://helloworl.com"
            };

            const findRepoPost = mock.method(postRepository, "findPostById", async (postId) => {
                return null;
            });

            await assert.rejects(async()=>{
                await postServices.patchPostById(id, data);
            }, (error) => {
                assert.equal(error.status, 404);
                return true;
            });

            assert.strictEqual(findRepoPost.mock.calls[0].arguments[0], id);

            assert.equal(findRepoPost.mock.callCount(), 1);

        });

    });

    describe("test deletePostById", () => {

        it("should return user deleted timestamp", async () => {
            const postId = 1;
            const deleted_at = '2024-08-13T03:21:45.123Z';
            const deleteRepomock = mock.method(postRepository, "deletePostById", async (postId) => {
                
                return {deleted_at};
            });
            
            const result = await postServices.deletePostById(postId);
            
            assert.equal(deleteRepomock.mock.calls[0].arguments, postId)

            assert.equal(deleteRepomock.mock.callCount(), 1);

            assert.equal(result.deleted_at, deleted_at);
        });

        it("should return []", async () => {
            const postId = '';
            const deleted_at = '2024-08-13T03:21:45.123Z';
            const deleteRepomock = mock.method(postRepository, "deletePostById", async (postId) => {
                
                return [];
            });
            
            const result = await postServices.deletePostById(postId);

            assert.equal(deleteRepomock.mock.calls[0].arguments, postId)

            assert.equal(deleteRepomock.mock.callCount(), 1);

            assert.deepStrictEqual(result, []);
        });

        it("should return error", async () => {
            const postId = '';
            const error = new Error("database error");
            const deleteRepomock = mock.method(postRepository, "deletePostById", async (postId) => {
                
                throw error;
            });

            await assert.rejects(async()=>{
                await postServices.deletePostById(postId);
            }, (error) => {
                assert.equal(error.message, 'database error');
                return true;
            });
            
            assert.equal(deleteRepomock.mock.calls[0].arguments, postId)

            assert.equal(deleteRepomock.mock.callCount(), 1);
        });

        it("should return 404", async () => {
            const postId = '';
            const deleteRepomock = mock.method(postRepository, "deletePostById", async (postId) => {
                
                return null;
            });

            await assert.rejects(async()=>{
                await postServices.deletePostById(postId);
            }, (error) => {
                assert.equal(error.status, 404);
                return true;
            });
            
            assert.equal(deleteRepomock.mock.calls[0].arguments, postId)

            assert.equal(deleteRepomock.mock.callCount(), 1);
        });

    });
});