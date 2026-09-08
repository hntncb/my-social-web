import * as postRepository from "./post.repository.js";

export const getPostPages = async (limit,offset) =>{
     
    const post = await postRepository.findPostsWithOffset(limit,offset);

    return post;
}

export const getPostWithCursor = async (post_number) =>{
     
    const post = await postRepository.findPostWithCursor(post_number);

    return post;
}

export const getPostById = async (id) => {
    const post = postRepository.findPostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    return post;
} 

export const createPost = async ({title, content, author_id, url}) => {
    
    if (!url) {
        url = null;
        return postRepository.createPost(
        title, 
        content,
        author_id,
        url
        );
    };

    console.log({title, content, author_id, url});

    return postRepository.createPostWithUrl(
        title, 
        content,
        author_id,
        url
    );

}

export const patchPostById = async (id) => {
    const post = postRepository.updatePostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    return post;
} 

export const deletePostById = async (id) => {
    const post = postRepository.deletePostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    return post;
} 