import commentRepository from "./comment.repository.js";

export const getAll = async() => {
    const comment = await commentRepository.findAll();
    return comment || [];
}
export const getByPostId = async(post_id) => {
    const comment = await commentRepository.findByPostId(post_id);
    return comment || [];
}
export const getReply = async(parent_id) => {
    const comment = await commentRepository.findReply(parent_id);
    if(!comment) {
        const error = new Error("khong co comment")
        error.statusCode = 404;
        throw error
    };
    return comment;
}
export const create = async(input) => {
    const comment = await commentRepository.create(input);
    if(!comment) {
        const error = new Error("khong co comment")
        error.statusCode = 404;
        throw error
    };
    return comment;
}
export const update = async(id, content) => {
    const comment = await commentRepository.update(id, content);
    if(!comment) {
        const error = new Error("khong co comment")
        error.statusCode = 404;
        throw error
    };
    return comment;
}
export const deleteById = async(id) => {
    const comment = await commentRepository.deleteById(id);
    if(!comment) {
        const error = new Error("khong co comment")
        error.statusCode = 404;
        throw error
    };
    return comment;
}

const commentServices = {getAll, getByPostId,getReply,create,update,deleteById};
export default commentServices;