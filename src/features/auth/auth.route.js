import {Router} from "express";
import * as authController from "./auth.controller.js";
import { validateUser } from "./auth.validation.js";

const router = Router();

/**
 * @openapi
 * /v1/auth/login:
 * 	
 *  post:
 *    tags: 
 *      - Auth
 *    summary: Đăng nhập
 *    requestBody:
 *      content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string 								 
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 1
 *                          
 *    responses:
 *      200:
 *        description: thành công
 *      
 */

router.post(
    "/login",
    validateUser,
    authController.login
);
/**
 * @openapi
 * /v1/auth/register:
 *  post:
 *    tags:
 *      - Auth
 *    summary: Đăng ký
 *    requestBody:
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                example: example@mail.com
 *              username:
 *                example: exampleuser
 *              password:
 *                example: examplepassword
 *    responses:
 *      201:
 *        description: thành công
 */  

router.post(
    "/register",
    validateUser,
    authController.create
);

export default router;