import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { addComment,
    deleteComment,
    getVideoComments, 
    updateComment } from "../controllers/comment.controller";

const router = Router()

router.use(verifyJWT)

router.route("/v/:videoId").get(getVideoComments).post(addComment)
router.route("/c/:commentId").patch(updateComment).delete(deleteComment)