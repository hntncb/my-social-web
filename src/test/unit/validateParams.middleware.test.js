import { describe, beforeEach, afterEach, it, mock } from "node:test";
import validateParams from "../../midlleware/validateParams.middleware.js";
import assert from "node:assert";

describe("test ValidateParams Middleware", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        req = { 
            headers: {},
            params: {},
            query: {},
            body: {}
        };
        res = {
            statusCode: null,
            body: null,
            status(code) {
                this.statusCode = code;
                return this;
            },
            json(data) {
                this.body = data;
                return this;
            }
        };
        next = mock.fn();
    });

    afterEach(() => {
        mock.restoreAll();
    });

    describe("test validationId", () => {
        it("should call next() when id is valid", () => {
            req.params.id = 1;

            validateParams.validationId(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when id is invalid", () => {
            req.params.id = "invalid-id";

            validateParams.validationId(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validationUsername", () => {
        it("should call next() when username is valid", () => {
            req.body.username = "valid_username";

            validateParams.validationUsername(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when username is empty", () => {
            req.body.username = "";

            validateParams.validationUsername(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });

        it("should return 400 when username contains invalid characters", () => {
            req.body.username = "$$$$$$";

            validateParams.validationUsername(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validationPassword", () => {
        it("should call next() when password is valid", () => {
            req.body.password = "valid_password1";

            validateParams.validationPassword(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when password is empty", () => {
            req.body.password = "";

            validateParams.validationPassword(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });

        it("should return 400 when password contains invalid characters", () => {
            req.body.password = "$$$$$$";

            validateParams.validationPassword(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validateCursorParams", () => {
        it("should call next() when cursor parameters are valid", () => {
            req.query.post_id = "1";
            req.query.limit = "10";

            validateParams.validateCursorParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when cursor parameters are empty", () => {
            req.query.post_id = "";
            req.query.limit = "";

            validateParams.validateCursorParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });

        it("should return 400 when post_id contains invalid characters", () => {
            req.query.post_id = "$$$$$$";
            req.query.limit = "10";

            validateParams.validateCursorParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validateOffsetParams", () => {
        it("should call next() when limit and offset parameters are valid", () => {
            req.query.limit = "1";
            req.query.offset = "10";

            validateParams.validateOffsetParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when offset parameters are empty", () => {
            req.query.limit = "";
            req.query.offset = "";

            validateParams.validateOffsetParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });

        it("should return 400 when limit contains invalid characters", () => {
            req.query.limit = "$$$$$$";
            req.query.offset = "10";

            validateParams.validateOffsetParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validateUserParams", () => {
        it("should call next() when user parameters are valid", () => {
            req.body.email = "valid_email@mail.com";
            req.body.username = "valid_username";
            req.body.password = "valid_password1";

            validateParams.validateUserParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should return 400 when user parameters are empty", () => {
            req.body.email = "";
            req.body.username = "";
            req.body.password = "";

            validateParams.validateUserParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });

        it("should return 400 when email format is invalid", () => {
            req.body.email = "valid_emailmail.com";
            req.body.username = "valid_username";
            req.body.password = "valid_password1";

            validateParams.validateUserParams(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
            assert.strictEqual(res.statusCode, 400);
        });
    });

    describe("test validateCreatePost", () => {
        it("should call next() when post payload is valid", () => {
            req.body.title = "valid_title";
            req.body.content = "valid_content";
            req.body.url = "http://valid_url.com";

            validateParams.validateCreatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should not call next() when title and content are empty", () => {
            req.body.title = "";
            req.body.content = "";
            req.body.url = "http://valid_url.com";

            validateParams.validateCreatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
        });

        it("should not call next() when url format is invalid", () => {
            req.body.title = "valid_title";
            req.body.content = "valid_content";
            req.body.url = "valid_url.com";

            validateParams.validateCreatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 0);
        });
    });

    describe("test validateUpdatePost", () => {
        it("should call next() when all post fields are provided", () => {
            req.body.title = "valid_title";
            req.body.content = "valid_content";
            req.body.url = "http://valid_url.com";

            validateParams.validateUpdatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should call next() when updating only title", () => {
            req.body.title = "valid_title";
            req.body.content = "";
            req.body.url = "";

            validateParams.validateUpdatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should call next() when updating only url", () => {
            req.body.title = "";
            req.body.content = "";
            req.body.url = "http://valid_url.com";

            validateParams.validateUpdatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });

        it("should call next() when updating only content", () => {
            req.body.title = "";
            req.body.content = "valid_content";
            req.body.url = "";

            validateParams.validateUpdatePost(req, res, next);

            assert.strictEqual(next.mock.calls.length, 1);
        });
    });
});