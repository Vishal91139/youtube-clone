import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { Video } from "../models/video.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    if(!req.user){
        throw new ApiError(400, "user to be logged!")
    }

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: req.user?._id
            }
        },
        {
            $count: "totalSubscribers"
        }
    ])

    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $count: "totalVideos"
        }
    ])

    const totalLikes = await Like.aggregate([
        {
            $match: {
                likedBy: req.user?._id
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    return res
      .status(200)
      .json(new ApiResponse(200, {totalSubscribers,totalVideos,totalLikes}, "fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const allVideo = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        }
    ])

    if(!allVideo.length){
        throw new ApiError(400, "no video found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, allVideo, "videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }