import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../midlleware/auth.middleware.js";
import { authorizeOwnerOrAdmin, authorizeOwner, authorizeRoles } from "../../midlleware/authorization.middleware.js";

const router = Router();

/**
 * @openapi
 * /v1/users:
 *   get:
 *     tags:
 *       - Users
 *     summary: '[Admin] Lấy danh sách user'
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: thành công
 */

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    userController.getAll
);
/**
 * @openapi
 * /v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: '[Admin] Tìm user qua id'
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses: 
 *       200:
 *         description: thành công
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    userController.getById
);
/**
 * @openapi
 * /v1/users/{id}:
 *   patch:
 *     tags: 
 *       - Users
 *     summary: '[Admin/Owner] Chỉnh sửa thông tin user'
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
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: thành công
 *       401:
 *         description: tai khoan hoac mat khau khong dung
 */
router.patch(
    "/:id",
    authenticate,
    authorizeOwnerOrAdmin,
    userController.patchById
);
/**
 * @openapi
 * /v1/users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: '[Admin] Xoá user qua id'
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *     responses: 
 *       200:
 *         description: thành công
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    userController.deleteById
);

export default router;