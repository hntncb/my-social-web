import bcrypt from "bcrypt";
import userRepository from "../users/user.repository.js";
import jwtGenToken from "../../utils/jwt.js";

const SALT_ROUNDS = 10;

export const login = async ({username, password})=>{
    const user = await userRepository.findByUsernamewithPassword(username);

    if (!user){
        const error = new Error("tai khoan hoac mat khau khong dung");
        error.statusCode = 401;
        throw error;
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if(!isPasswordValid){
        const error = new Error("tai khoan hoac mat khau khong dung");
        error.statusCode = 401;
        throw error;
    }

    const accessToken = jwtGenToken.generateAccessToken(user);

    return {
        user:{
            id: user.id,
            email: user.email,
            username: user.username    
        },
        accessToken
    };
};

export const create = async ({ email, username, password }) => {
    const existingUser = await userRepository.findByUsername(username);

    if (existingUser) {
        const error = new Error("username da ton tai");
        error.statusCode = 409;
        throw error;
    }

    const password_hash = await bcrypt.hash(
        password,
        SALT_ROUNDS
    );

    return userRepository.createUser({
        email,
        username,
        password_hash,
    });
}; 

const authServices = {login, create};

export default authServices;