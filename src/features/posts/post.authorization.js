import postRepository from "./post.repository.js";

const check = (allowAdmin) => async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const post = Number.isInteger(id) ? await postRepository.findPostById(id) : null;

        if (!post) {
            return res.status(404).json({ success: false, message: "bai viet khong ton tai" });
        }

        const isOwner = Number(post.author_id) === req.user.id;
        const isAdmin = allowAdmin && req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "ban khong co quyen thuc hien thao tac nay" });
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const authorizePostOwner = check(false);
export const authorizePostOwnerOrAdmin = check(true);