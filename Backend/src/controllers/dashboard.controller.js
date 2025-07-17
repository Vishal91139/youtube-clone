import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError"
import { Video } from "../models/video.model"
import { ApiResponse } from "../utils/ApiResponse"
import { Subscription } from "../models/subscription.model"
import { Like } from "../models/like.model"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const { channelId } = req.params

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    if(req.user){
        throw new ApiError(400, "user to be logged!")
    }

    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
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
    const { channelId } = req.params

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const allVideo = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
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