import * as postRepository from "./post.repository.js";
import transaction from "../../database/transaction.js";
export const getPostsWithOffset = async (limit,offset) =>{
     
    const post = await postRepository.findPostsWithOffset(limit,offset);

    return post;
}

export const getPostWithCursor = async (post_number) =>{
     
    const post = await postRepository.findPostsWithCursor(post_number);

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
    const splitData = () => {
        const result = {
            posts: {},
            postLink: {},
        }
        
        for (const [key, value] of Object.entries(data)){
            const field = fieldMap[key];
            result[field][key] = value;
        };
        data = result;
    };

    splitData();

    if(!data["postLink"]){
        await postRepository.updatePostById(id, data);
    }else{
        return transaction(async(client) => {
            //console.log(id, data.posts);
            const post = await postRepository.updatePostById(client, id, data.posts);
            
            await postRepository.upsertPostLink(client, post.id, data.postLink);
            return post;
        });
    };

};

export const deletePostById = async (id) => {
    const post = postRepository.deletePostById(id);
    
    if (!post) {
        const error = new Error("bai viet khong ton tai");
        error.status = 404;
        throw error;
    }

    return post;
};