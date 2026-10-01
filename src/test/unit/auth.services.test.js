import { mock, afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert";
import authServices from "../../features/auth/auth.service.js";
import userRepository from "../../features/users/user.repository.js";
import bcrypt from "bcrypt";
import jwtGenToken from "../../utils/jwt.js";

describe("test authServices", () => {
    let mockUser;
    beforeEach(() => {
        mockUser = [
            {
                id: 1,
                email: "nguyen.van.an@gmail.com",
                username: "annguyen",
                password_hash: "$2a$10$.ZIzpALTa19K6KxjHwEPtOF4fkjMcqYIjb/J/N8ffx6k2ErWbnGIa",
                role: "user",
                created_at: "2024-01-15T08:30:00Z",
                deleted_at: null
            },
            {
                id: 2,
                email: "tran.thi.bich@yahoo.com",
                username: "bichtran",
                password_hash: "$2a$10$FRzsoW5sOUPcAhRViQnJmud/ZIdHa7xRzCYV8Tk6JFeh6wc.rMO3u",
                role: "admin",
                created_at: "2024-02-20T10:15:00Z",
                deleted_at: null
            }
        ];
    });

    afterEach(() => {
        mock.reset();
        mock.restoreAll();
    });

    describe("test login", () => {
        //happy path
        it("should return registered username and access token", async () => {
            const username = "annguyen";
            const password = "1";
            const user = { username, password };
            const expectedToken = "mocked_jwt_token";

            const mockRepoFindUsername = mock.method(
                userRepository, 
                "findByUsernamewithPassword", 
                async () => mockUser[0]
            );

            mock.method(bcrypt, "compare", async () => true);

            mock.method(
                jwtGenToken, 
                "generateAccessToken", 
                () => expectedToken
            );

            const result = await authServices.login(user);

            assert.deepStrictEqual(result.user.username, mockUser[0].username);
            assert.strictEqual(result.accessToken, expectedToken);

            assert.strictEqual(mockRepoFindUsername.mock.callCount(), 1);
            assert.strictEqual(
                mockRepoFindUsername.mock.calls[0].arguments[0], 
                username
            );
        });
        
        //findByUsernamewithPassword không tìm thấy user
        it("should return 401 when username not valid", async () => {
            const username = "annguyen";
            const password = "1";
            const user = { username, password };
            const expectedToken = "mocked_jwt_token";

            const mockRepoFindUsername = mock.method(
                userRepository, 
                "findByUsernamewithPassword", 
                async () => null
            );

            mock.method(bcrypt, "compare", async () => true);

            mock.method(
                jwtGenToken, 
                "generateAccessToken", 
                () => expectedToken
            );

            const result = await assert.rejects(async()=> {
                await authServices.login(user);
            },(error)=>{
                assert.equal(error.message, 'tai khoan hoac mat khau khong dung');
                assert.equal(error.statusCode, 401);
                return true;
            });
            
            assert.strictEqual(mockRepoFindUsername.mock.callCount(), 1);
            assert.strictEqual(
                mockRepoFindUsername.mock.calls[0].arguments[0], 
                username
            );
        });
        // isPasswordValid = bcrypt.compare false => sai mật khẩu
        it("should return 401 when password not valid", async () => {
            const username = "annguyen";
            const password = "1";
            const user = { username, password };
            const expectedToken = "mocked_jwt_token";

            const mockRepoFindUsername = mock.method(
                userRepository, 
                "findByUsernamewithPassword", 
                async () => mockUser[0]
            );

            mock.method(bcrypt, "compare", async () => false);

            mock.method(
                jwtGenToken, 
                "generateAccessToken", 
                () => expectedToken
            );

            const result = await assert.rejects(async()=> {
                await authServices.login(user);
            },(error)=>{
                assert.equal(error.message, 'tai khoan hoac mat khau khong dung');
                assert.equal(error.statusCode, 401);
                return true;
            });

            assert.strictEqual(mockRepoFindUsername.mock.callCount(), 1);
            assert.strictEqual(
                mockRepoFindUsername.mock.calls[0].arguments[0], 
                username
            );
        });
    });

    describe("test create", () => {
        //happy path
        it("should return registered username when created successfully", async () => {
            const username = "bichtran";
            const password = "1";
            const user = { username, password };
            const password_hash = "$2a$10$FRzsoW5sOUPcAhRViQnJmud/ZIdHa7xRzCYV8Tk6JFeh6wc.rMO3u";

            const mockRepoFindUsername = mock.method(userRepository, "findByUsername", async () => {
                return null;
            });

            mock.method(bcrypt, "hash", async () => password_hash);

            const mockCreateUser = mock.method(userRepository, "createUser", async () => {
                return mockUser[1];
            });

            const result = await authServices.create(user);

            assert.deepStrictEqual(result.username, mockUser[1].username);
            
            assert.strictEqual(mockRepoFindUsername.mock.callCount(), 1);
            assert.strictEqual(
                mockRepoFindUsername.mock.calls[0].arguments[0],
                username
            );
        });
        //findByUsername trả về existingUser = mockUser[1] => 409 + đã tồn tại
        it("should return status 409 when already exists", async () => {
            const username = "bichtran";
            const password = "1";
            const user = { username, password };
            const password_hash = "$2a$10$FRzsoW5sOUPcAhRViQnJmud/ZIdHa7xRzCYV8Tk6JFeh6wc.rMO3u";

            const mockRepoFindUsername = mock.method(userRepository, "findByUsername", async () => {
                return mockUser[1];
            });

            mock.method(bcrypt, "hash", async () => password_hash);

            const mockCreateUser = mock.method(userRepository, "createUser", async () => {
                return mockUser[1];
            });

            const result = await assert.rejects(async()=>{
                await authServices.create(user);
            }, (error)=>{
                assert.equal(error.message, 'username da ton tai');
                assert.equal(error.statusCode, 409);
                return true;
            });
            
            assert.strictEqual(mockRepoFindUsername.mock.callCount(), 1);
            assert.strictEqual(
                mockRepoFindUsername.mock.calls[0].arguments[0],
                username
            );
        });
    });
});