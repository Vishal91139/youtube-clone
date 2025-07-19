import { Router } from "express";
import { 
    addVideoToPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getPlaylistById, 
    getUserPlaylists, 
    removeVideoFromPlaylist, 
    updatePlaylist } from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.use(verifyJWT)

router.route("/").post(createPlaylist)
router.route("/user/:userId").get(getUserPlaylists)
    
router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

router.route("/:playlistId")
    .get(getPlaylistById)   
    .delete(deletePlaylist)
    .patch(updatePlaylist)

export default router