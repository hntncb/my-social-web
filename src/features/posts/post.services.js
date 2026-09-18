import postRepository from "./post.repository.js";
import {transaction} from "../../database/transaction.js";

export const getPostsWithOffset = async (limit,offset) =>{
     
    const post = await postRepository.findPostsWithOffset(limit,offset);

    return post;
}

export const getPostWithCursor = async (post_id, limit) =>{
     
    const post = await postRepository.findPostsWithCursor(post_id, limit);

    return post;
}

export const getPostById = async (id) => {
    const post = await postRepository.findPostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }
    
    return post;
} 

export const createPost = async ({title, content, author_id, url}) => {
    
    if (!url || !url.trim()) {
        url = null;
        return postRepository.createPost(
        title, 
        content,
        author_id
        );
    };

    return postRepository.createPostWithUrl(
        title, 
        content,
        author_id,
        url
    );

};

export const patchPostById = async (id, data) => {

    const post = await postRepository.findPostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    const fieldMap = {
        title: "posts",
        content: "posts",
        url: "postLink",
    }
    //nếu key của fieldMap == key của data => đẩy key-value object có tên key của fieldMap
    //nếu postLink có dữ liệu thì update bảng post_links
    const splitData = {
        posts: {},
        postLink: {},
    };

    for (const [key, value] of Object.entries(data)) {
        const targetGroup = fieldMap[key];
        if (targetGroup) {
            splitData[targetGroup][key] = value;
        }
    }

    const hasPostsData = Object.keys(splitData.posts).length > 0;
    const hasPostLinkData = Object.keys(splitData.postLink).length > 0;

    return transaction(async (client) => {
        let updatedPost = post;
        let updatedLink = {};

        if (hasPostsData) {
            updatedPost = await postRepository.updatePostById(client, id, splitData.posts);
        }

        if (hasPostLinkData) {
            updatedLink = await postRepository.upsertPostLink(client, id, splitData.postLink);
        }

        return {
            ...updatedPost,
            ...updatedLink
        };
    });

};

export const deletePostById = async (id) => {
    const post = await postRepository.deletePostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    return post;
};

const postServices = {getPostsWithOffset, getPostById,getPostWithCursor,getPostsWithOffset, createPost, patchPostById,deletePostById};

export default postServices;