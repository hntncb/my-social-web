import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import authorizationMiddleware from "../../midlleware/authorization.middleware.js";

describe("test autorization", () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = {headers: {}};
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

    describe("test authorizeOwner",()=>{
        it("should return user autorization",()=>{

            const req = {
                params: {
                    id: "1"
                },
                user: {
                    id: 1,
                    role: "user"
                }
            };
 
            authorizationMiddleware.authorizeOwner(req, res, next);

            assert.equal(next.mock.callCount(), 1);
        });
    })
    describe("test authorizeOwnerOrAdmin",()=>{
        it("should return user autorization",()=>{

            const req = {
                params: {
                    id: "1"
                },
                user: {
                    id: 1,
                    role: "admin"
                }
            };
 
            authorizationMiddleware.authorizeOwnerOrAdmin(req, res, next);

            assert.equal(next.mock.callCount(), 1);
        });
    })
    describe("test authorizeAdmin",()=>{
        it("should return user autorization",()=>{

            const req = {
                user: {
                    role: "user"
                }
            };
 
            authorizationMiddleware.authorizeAdmin(req, res, next);

        });
    })
    describe("test authorizeRoles",()=>{
        it("should return user autorization",()=>{

            const req = {
                user: {
                    role: "user"
                }
            };
 
            authorizationMiddleware.authorizeRoles(req, res, next);

        });
    })
});    