import commentServices from "./comment.services.js";

export const getAll = async(req, res) => {
    const comment = await commentServices.getAll();
    res.status(200).json(comment);
}
export const getByPostId = async(req, res) => {
    const comment = await commentServices.getByPostId(req.params.post_id);
    
    res.status(200).json(comment);
}
export const getReply = async(req, res) => {
    const comment = await commentServices.getReply(req.params.parent_id);
    
    res.status(200).json(comment);
}
export const create = async(req, res) => {
    const user_id = req.user.id;
    const {post_id, parent_id, content} = req.body;
    const comment = await commentServices.create({user_id,post_id, parent_id, content});
    
    res.status(201).json(comment);
}
export const update = async(req, res) => {
    const {content} = req.body;
    const comment = await commentServices.update(req.params.id, content);
    
    res.status(200).json(comment);
}
export const deleteById = async(req, res) => {
    await commentServices.deleteById(req.params.id);
    
    res.status(204).send();
}

const commentController = {getAll, getByPostId,getReply,create,update,deleteById};
export default commentController;