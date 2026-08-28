import * as userService from "./user.service.js";

export const getAll = async (req, res) => {
    const users = await userService.getAll();

    return res.json(users);
};

export const getById = async (req, res) => {
    const user = await userService.getById(req.params.id);

    return res.json(user);
};

export const patchById = async (req, res) => {
    const user = await userService.patchById(req.params.id, req.body);

    return res.status(200).json({
        message: "cap nhat thanh cong",
        data: user
    });
};

export const deleteById = async (req, res) => {
    const user = await userService.deleteById(req.params.id);
    return res.status(200).json({
        message: "xoa thanh cong"
    })
};