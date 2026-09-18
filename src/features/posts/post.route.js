import { Router } from "express"
import * as postController from "./post.controller.js" 
import { authorizeOwner, authorizeOwnerOrAdmin } from "../../midlleware/authorization.middleware.js";
import { authenticate } from "../../midlleware/auth.middleware.js"

const route = Router();
/**
 * @openapi
 * /v1/posts/pages:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Lấy danh sách bài viết theo trang
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: số bài viết trong 1 trang
 * 
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: thành công
 */
route.get(
    "/pages",
    postController.getPostsWithOffset
);
/**
 * @openapi
 * /v1/posts:
 *  get:
 *    tags:
 *      - Posts
 *    summary: Lấy danh sách bài viết theo con trỏ
 *      
 *    parameters:
 *      - in: query
 *        name: post_id
 *        schema: 
 *          type: integer
 *      - in: query
 *        name: limit
 *        schema: 
 *          type: integer   
 *    responses:
 *      200:
 *        description: thành công
 */
route.get(
    "/",
    postController.getPostWithCursor
); 
/**
 * @openapi
 * /v1/posts/{id}:
 *  get:
 *    tags: 
 *      - Posts
 *    summary: tìm bài viết theo id
 *    parameters:
 *      - in: path
 *        required: true
 *        name: id
 *        default: 1
 *    responses:
 *      200:
 *        description: thành công
 */
route.get(
    "/:id",
    postController.getPostById
);
/**
 * @openapi
 * /v1/posts:
 *  post:
 *    tags:
 *      - Posts
 *    summary: tạo bài viết mới
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                example: bai viet
 *              content:
 *                example: chao xin moi nguoi
 *              url:
 *                example: https:example@mail.com
 *    responses:
 *      200:
 *        description: thành công
 */

route.post(
    "/",
    authenticate,
    postController.createPost
); 

/**
 * @openapi
 * /v1/posts/{id}:
 *  patch:
 *    tags:
 *      - Posts
 *    summary: sửa bài viết
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              title:
 *                example: bai viet
 *              content:
 *                example: chao xin moi nguoi
 *              url:
 *                example: https:example@mail.com
 *    responses:
 *      200:
 *        description: thành công
 */

route.patch(
    "/:id",
    authenticate,
    authorizeOwner,
    postController.patchPostById
);

/**
 * @openapi
 * /v1/posts/{id}:
 *  delete:
 *    tags:
 *      - Posts
 *    summary: xoá bài viết theo id
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *    responses:
 *      200:
 *        description: thành công
 */

route.delete(
    "/:id",
    authenticate,
    authorizeOwnerOrAdmin,
    postController.deletePostById
);

export default route;