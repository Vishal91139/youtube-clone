import mongoose, { isValidObjectId, mongo } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!(name || description)) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist) {
        throw new ApiError(400, "Error while creating playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid UserId!")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId) 
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "playlistVideos"
            }
        }
    ])

    if(!playlists.length) {
        throw new ApiError(400, "there is no videos in playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId!")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        // {
        //     $lookup: {
        //         from: "videos",
        //         localField: "videos",
        //         foreignField: "_id",
        //         as: "playlistVideos"
        //     }
        // }
    ])

    if(!playlists.length) {
        throw new ApiError(400, "there is no videos in playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlists, "playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId!")
    }
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?._id
        },
        {
            $addToSet: {
                videos: videoId
            }
        },
        { new: true }
    )

    if(!playlist){
        throw new ApiError(400, "Error while adding video to playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const deletedVideo = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user?.id
        },
        {
            $pull: {
                videos: videoId
            }
        },
        { new: true }
    )

    if(!deletedVideo) {
        throw new ApiError(400, "Error while deleting video")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, deletedVideo, "video deleted successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    const playlist = await Playlist.findOneAndDelete(
        {
            _id: playlistId,
            owner: req.user?._id
        }
    )

    if(!playlist) {
        throw new ApiError(400, "Error while deleting playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId")
    }

    if(!(name || description)) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.findOneAndUpdate(
       {
        _id: playlistId,
        owner: req.user?._id
       },
       {
        $set: {
            name,
            description
        }
       },
       { new : true }
    )

    if(!playlist){
        throw new ApiError(400, "Error while updating playlist")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "playlist updated Successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}