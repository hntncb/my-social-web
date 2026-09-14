import * as authServices from "./auth.service.js"

export const login = async (req, res) => {
    const user = await authServices.login(req.body);

    return res.status(200).json({
        message: "dang nhap thanh cong",
        data: user
    });
};

export const create = async (req, res) => {
    const user = await authServices.create(req.body);

    return res.status(201).json(user);
};