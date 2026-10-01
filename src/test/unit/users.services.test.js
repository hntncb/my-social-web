import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import * as userServices from "../../features/users/user.service.js";
import userRepository from "../../features/users/user.repository.js";

describe("test userservices", () => {
    let mockUser;

    beforeEach(() => {
        mockUser = [
            {
                id: 1,
                email: "nguyen.van.an@gmail.com",
                username: "annguyen",
                password_hash: "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy",
                created_at: "2024-01-15T08:30:00Z",
                deleted_at: null
            },
            {
                id: 2,
                email: "tran.thi.bich@yahoo.com",
                username: "bichtran",
                password_hash: "$2b$10$Xk8zJ5vQ9wLmN3pR7tY2uOeF1aB4cD6eG8hI0jK2lM4nO6pQ8rS0t",
                created_at: "2024-02-20T10:15:00Z",
                deleted_at: null
            }
        ];
    });

    afterEach(() => {
        mock.restoreAll();
    });

    describe("test getAll", () => {
        it("should return all users", async () => {
            mock.method(userRepository, "findAll", async () => {
                return mockUser;
            });

            const result = await userServices.getAll();

            assert.deepStrictEqual(result, mockUser);
        });
    });

    describe("test getById", () => {
        it("should return all users", async () => {
            const id = 2;

            const expectedUser = mockUser.find((u) => {
                return u.id === id;
            });

            mock.method(userRepository, "findById", async (params_id) => {
                
                const mockUserMap = mockUser.map(
                    ({id, email, username, deleted_at})=>
                    (({id, email, username, deleted_at})));

                for(const user of mockUserMap){
                    if(user.id === params_id){
                        return user;
                        }
                    };
                }
            );

            const result = await userServices.getById(id);
            assert.deepStrictEqual(result.id, expectedUser.id);
        });
    });
    describe("test patchById", () => {
        it("should return edited user", async () => {
            const id = 1;
            
            const patchData = {
                email: "nguyen.van.an@gmail.com",
                username: "annguyen",
                password: "1",
                updated_at: "2026-09-16T08:30:00Z"
            };
            
            mock.method(userRepository, "updateById", async (patchData) => {
                const user = mockUser.find((u)=>{
                    return u.id === id;
                });
                
                if (patchData.email){
                    user.email = patchData.email;
                }
                if (patchData.username){
                    user.username = patchData.username;
                }
                if (patchData.password){
                    user.password_hash = patchData.password_hash;
                }
                
                return user;
            });

            const result = await userServices.patchById(id, patchData);

            assert.strictEqual(result.email, patchData.email);
            assert.strictEqual(result.username, patchData.username);
        });
    });
    describe("test deleteById", () => {
        it("should return deleted user", async () => {
            const id = 1;
            let user;
            mock.method(userRepository, "findById", async (id) => {
                user = mockUser.find((u)=>{
                    return u.id === id;
                });
                return user;
            });
            
            mock.method(userRepository, "deleteById", async () => {
                user.deleted_at = "2026-09-16T08:30:00Z";
                return user;
            });

            const result = await userServices.deleteById(id);

            assert.strictEqual(result.id, id);
            assert.notStrictEqual(user.deleted_at, null);
            assert.strictEqual(typeof user.deleted_at, "string");
        });
    });
});