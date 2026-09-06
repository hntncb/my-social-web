import { Router } from "express"
import * as postController from "./post.controller.js" 
import { authorizeOwner, authorizeOwnerOrAdmin } from "../../midlleware/authorization.middleware.js";
import { authenticate } from "../../midlleware/auth.middleware.js"

const route = Router();

route.get(
    "/",
    postController.getAllPosts
); 

route.get(
    "/:id",
    postController.getPostById
);

route.post(
    "/",
    authenticate,
    postController.createPost
); 

route.patch(
    "/:id",
    authenticate,
    authorizeOwner,
    postController.patchPostById
); 

route.delete(
    "/:id",
    authenticate,
    authorizeOwnerOrAdmin,
    postController.deletePostById
); 

export default route;