import * as postService from "./post.services.js"

export const getPostsWithOffset = async (req, res) => {
    const post = await postService.getPostsWithOffset(req.params);
    
    return res.json(post);
} 

export const getPostWithCursor = async (req, res) => {
    const post = await postService.getPostWithCursor(req.params);
    
    return res.json(post);
} 

export const getPostById = async (req, res) => {
    const post = postService.getPostById(req.params.id);

    return res.json(post);
}

export const createPost = async (req, res) => {
    
    const author_id = req.user.id;

    const post = await postService.createPost({...req.body, author_id});
    console.log(req.body, author_id, post)
    return res.json(post)
}

export const patchPostById = async (req, res) => {
    const post = await postService.patchPostById(req.params.id,req.body);

    return res.status(200).json({
        message: "sua thanh cong",
        data: post
    });
}

export const deletePostById = async (req, res) => {
    await postService.deletePostById(req.params.id);

    return res.status(200).json({message: "xoa thanh cong"})
}