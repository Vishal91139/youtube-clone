import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    getSubscribedChannels, 
    getUserChannelSubscribers, 
    toggleSubscription } from "../controllers/subscription.controller.js";

const router = Router()

router.use(verifyJWT)

router.route("/subscribedChannels").get(getSubscribedChannels)
router.route("/:channelId").get(getUserChannelSubscribers).post(toggleSubscription)

export default router