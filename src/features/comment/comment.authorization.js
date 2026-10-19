import commentRepository from "./comment.repository.js";

const check = (allowAdmin) => async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const comment = Number.isInteger(id) ? await commentRepository.findById(id) : null;
        if (!comment) {
            return res.status(404).json({ success: false, message: "binh luan khong ton tai" });
        }
        const isOwner = Number(comment.user_id) === req.user.id;
        const isAdmin = allowAdmin && req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "ban khong co quyen thuc hien thao tac nay" });
        }
        next();
    } catch (err) {
        next(err);
    }
};

export const authorizeCommentOwner = check(false);
export const authorizeCommentOwnerOrAdmin = check(true);