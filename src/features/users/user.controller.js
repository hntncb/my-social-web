import * as userService from "./user.service.js";

export const getAll = async (req, res) => {
    const users = await userService.getAll();

    return res.status(200).json({
        status: "success",
        data: users
    });
};

export const getById = async (req, res) => {
    const user = await userService.getById(req.params.id);

    return res.status(200).json({
        status: "success",
        data: user
    });
};

export const patchById = async (req, res) => {
    const updateData = {};
    if (req.body.email !== undefined) updateData.email = req.body.email;
    if (req.body.username !== undefined) updateData.username = req.body.username;
    if (req.body.password !== undefined) updateData.password = req.body.password;

    const user = await userService.patchById(req.params.id, updateData);

    return res.status(200).json({
        status: "success",
        data: user
    });
};

export const deleteById = async (req, res) => {
    const user = await userService.deleteById(req.params.id);
    return res.status(200).json({
        message: "xoa thanh cong"
    })
};