import { Router } from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../midlleware/auth.middleware.js";
import { authorizeAdmin, authorizeOwner, authorizeRoles } from "../../midlleware/authorization.middleware.js";

const router = Router();

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    userController.getAll
);

router.get(
    "/:id",
    authenticate,
    authorizeOwner,
    userController.getById
);

router.patch(
    "/:id",
    authenticate,
    authorizeOwner,
    userController.patchById
);

router.delete(
    "/:id",
    authenticate,
    authorizeRoles("admin"),
    userController.deleteById
);

export default router;