import * as authServices from "./auth.service.js"

export const login = async (req, res) => {

    const {username, password} = req.body;
    const user = await authServices.login({username, password});

    return res.status(200).json({
        message: "dang nhap thanh cong",
        data: user
    });
};

export const create = async (req, res) => {
    
    const {email, username, password} = req.body;
    const user = await authServices.create({email, username, password});

    return res.status(201).json({
        message: "dang ky thanh cong",
        data: user
    });
};