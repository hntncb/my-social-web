import {Router} from "express";
import * as authController from "./auth.controller.js";
import { validateCreateUser } from "./auth.validation.js";

const router = Router();

router.post(
    "/login",
    authController.login
);

router.post(
    "/register",
    validateCreateUser,
    authController.create
);

export default router;