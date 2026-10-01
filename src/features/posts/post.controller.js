import * as postService from "./post.services.js";

export const getPostsWithOffset = async (req, res) => {
    const { limit, offset } = req.query;
    const post = await postService.getPostsWithOffset(limit, offset);
    
    return res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết thành công",
        data: post
    });
};

export const getPostWithCursor = async (req, res) => {
    const { post_id, limit } = req.query;
    const post = await postService.getPostWithCursor(post_id, limit);
    
    return res.status(200).json({
        success: true,
        message: "Lấy danh sách bài viết thành công",
        data: post
    });
};

export const getPostById = async (req, res) => {
    const post = await postService.getPostById(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Lấy chi tiết bài viết thành công",
        data: post
    });
};

export const createPost = async (req, res) => {
    const author_id = req.user.id;
    const { title, content, url } = req.body;
    const post = await postService.createPost({ title, content, author_id, url });

    return res.status(201).json({
        success: true,
        message: "Tạo bài viết thành công",
        data: post
    });
};

export const patchPostById = async (req, res) => {
    const post = await postService.patchPostById(req.params.id, req.body);

    return res.status(200).json({
        success: true,
        message: "Sửa thành công",
        data: post
    });
};

export const deletePostById = async (req, res) => {
    await postService.deletePostById(req.params.id);

    return res.status(200).json({
        success: true,
        message: "Xóa thành công"
    });
};