import { Router } from "express";
import { 
    getLikedVideos, 
    toggleCommentLike, 
    toggleTweetLike, 
    toggleVideoLike } from "../controllers/like.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router()

router.use(verifyJWT)

router.route("/videos").get(getLikedVideos)
router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)

export default router