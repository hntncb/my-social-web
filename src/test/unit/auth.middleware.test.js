import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import authMiddleware from "../../midlleware/auth.middleware.js";
import jwt from "jsonwebtoken";

describe("test authservices", () => {
    let req;
    let res;
    let next;
    
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwicm9sZSI6InVzZXJzIiwiaWF0IjoxNzg5NjI3NjY3LCJleHAiOjU0MTc4OTYyNzY2N30.sonqr_-q-ElzAhFijv_I9rhhVEIQqPMqhQZyw5xYG3c";

    beforeEach(() => {
        req = { headers: {} };
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

    describe("test authenticate", () => {
        it("should return admin authenticated", () => {
            mock.method(jwt, "verify", () => ({
                sub: 1,
                role: "admin"
            }));

            req.headers.authorization = `Bearer ${token}`;

            authMiddleware.authenticate(req, res, next);

            assert.strictEqual(next.mock.callCount(), 1);
            assert.deepStrictEqual(req.user, { id: 1, role: "admin" });
        });

        it("should return user authenticated", () => {
            mock.method(jwt, "verify", () => ({
                sub: 2,
                role: "user"
            }));

            req.headers.authorization = `Bearer ${token}`;

            authMiddleware.authenticate(req, res, next);

            assert.strictEqual(next.mock.callCount(), 1);
            assert.deepStrictEqual(req.user, { id: 2, role: "user" });
        });

        it("should return 401 when authorization header is missing", () => {
            authMiddleware.authenticate(req, res, next);

            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(next.mock.callCount(), 0);
            assert.deepStrictEqual(res.body, { message: "chua dang nhap" });
        });

        it("should return 401 when token is missing", () => {
            req.headers.authorization = "Bearer";

            authMiddleware.authenticate(req, res, next);

            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(next.mock.callCount(), 0);
            assert.deepStrictEqual(res.body, { message: "token khong hop le" });
        });

        it("should return 401 when token verification fails", () => {
            mock.method(jwt, "verify", () => {
                throw new Error("jwt expired");
            });

            req.headers.authorization = `Bearer ${token}`;

            authMiddleware.authenticate(req, res, next);

            assert.strictEqual(res.statusCode, 401);
            assert.strictEqual(next.mock.callCount(), 0);
            assert.deepStrictEqual(res.body, { message: "token khong hop le hoac da het han" });
        });
    });
});