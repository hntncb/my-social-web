import { Router } from "express";
import { authorizeCommentOwner, authorizeCommentOwnerOrAdmin } from "../comment/comment.authorization.js";
import { authenticate } from "../../midlleware/auth.middleware.js";
import validateParams from "../../midlleware/validateParams.middleware.js";
import commentController from "./comment.controller.js";

const route = Router();

// Middleware phụ trợ kiểm tra tham số dạng số nguyên dương theo tên param
const validateParamId = (paramName) => (req, res, next) => {
    const rawValue = req.params[paramName];
    const parsedValue = Number(rawValue);
    if (!rawValue || isNaN(parsedValue) || parsedValue < 0 || !Number.isInteger(parsedValue)) {
        return res.status(400).json({
            success: false,
            message: `${paramName} khong hop le hoac bi thieu`
        });
    }
    req.params[paramName] = parsedValue;
    next();
};

/**
 * @openapi
 * /v1/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Lấy danh sách tất cả bình luận
 *     responses:
 *       200:
 *         description: Thành công
 */
route.get("/", commentController.getAll);

/**
 * @openapi
 * /v1/comments/post/{post_id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Lấy danh sách bình luận theo bài viết
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
route.get(
    "/post/:post_id",
    validateParamId('post_id'),
    commentController.getByPostId
);

/**
 * @openapi
 * /v1/comments/reply/{parent_id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Lấy danh sách bình luận trả lời (reply) theo parent_id
 *     parameters:
 *       - in: path
 *         name: parent_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thành công
 */
route.get(
    "/reply/:parent_id",
    validateParamId('parent_id'),
    commentController.getReply
);

/**
 * @openapi
 * /v1/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Tạo bình luận mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               post_id:
 *                 type: integer
 *               parent_id:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Thành công
 */
route.post(
    "/",
    authenticate,
    commentController.create
);

/**
 * @openapi
 * /v1/comments/{id}:
 *   patch:
 *     tags:
 *       - Comments
 *     summary: Sửa nội dung bình luận theo id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thành công
 */
route.patch(
    "/:id",
    authenticate,
    authorizeCommentOwner,
    validateParams.validationId,
    commentController.update
);

/**
 * @openapi
 * /v1/comments/{id}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Xoá bình luận theo id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Thành công
 */
route.delete(
    "/:id",
    authenticate,
    authorizeCommentOwnerOrAdmin,
    validateParams.validationId,
    commentController.deleteById
);

export default route;