import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError"
import { Like } from "../models/like.model"
import { ApiResponse } from "../utils/ApiResponse"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const existingLike = await Like.findOne({ video:videoId, likedBy:req.user?._id })

    if(existingLike) {
        existingLike.deleteOne()
        return res.status(200, {}, "video Unliked!")
    } 

    const videoLiked = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
      .status(200)
      .json(new ApiResponse(200, videoLiked, "video Liked!!"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid CommentId!!")
    }

    const existingLike = await Like.findOne({ comment:commentId, likedBy:req.user?._id })

    if(existingLike) {
        await existingLike.deleteOne()
        return res.status(200, {}, "comment unliked!")
    }

    const likedComment = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "comment Liked!"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId!!")
    }

    const existingLike = await Like.findOne({ comment:tweetId, likedBy:req.user?._id })

    if(existingLike) {
        await existingLike.deleteOne()
        return res.status(200, {}, "Tweet unliked!")
    }

    const likedTweet = await Like.create({
        comment: tweetId,
        likedBy: req.user?._id
    })

    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "Tweet Liked!"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    if(req.user) {
        throw new ApiError(400, "user should to be loggedIn")
    }

    const likedVideo = await Like.aggregate(
        {
            $match: {
                likedBy: req.user._id
            },
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videosLikedByUser",
                pipeline: [
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title:1,
                            duration:1,
                            views:1,
                            owner:1
                        }
                    }
                ]
            }
        }
    )

    if(!likedVideo) {
        throw new ApiError(400, "there is no liked videos")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo[0].videosLikedByUser, "liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}