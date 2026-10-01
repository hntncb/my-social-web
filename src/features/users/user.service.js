import userRepository from "./user.repository.js";
//import redisClient from "../../database/redis.js"
import bcrypt from 'bcrypt';

const SALT_ROUND = 10;

export const getAll = async () => {
    return userRepository.findAll();
};

export const getById = async (id) => {
    const cacheKey = `user:${id}`;
    //const cachedUser = await redisClient.get(cacheKey);
    const user = await userRepository.findById(id);

    /*if (cachedUser) {
        console.log("GET USER FROM REDIS");

        return JSON.parse(cachedUser)
    }

    console.log("GET USER FROM POSTGRESQL");*/

    if (!user) {
        const error = new Error("khong tim thay user");
        error.statusCode = 404;
        throw error;
    }

    /*await redisClient.set(
        cachedUser, 
        JSON.stringtify(user),
        {
            EX: 60
        }
    )*/

    return user;
};

export const patchById = async (id, data) => {
    if (Object.keys(data).length === 0){
        const error = new Error("khong co du lieu de cap nhat");
        error.statusCode = 400;
        throw error;
    }

    if (data.password !== undefined) {
            const password_hash = await bcrypt.hash(data.password, SALT_ROUND)
            data.password_hash = password_hash;
        }

    const user = await userRepository.updateById(id, data);

    if (!user) {
        const error = new Error("khong cap nhat duoc");
        error.statusCode = 404; 
        throw error;
    }

    //await redisClient.del(`user:${id}`);
    return user;
};

export const deleteById = async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
        const error = new Error("khong tim thay user");
        error.statusCode = 404;
        throw error;
    }

    await userRepository.deleteById(id)
    
    //await redisClient.del(`user:${id}`);

    return user;
};