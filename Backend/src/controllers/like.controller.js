import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/like.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const videoDoc = await Video.findById(videoId);
    if(!videoDoc) {
        throw new ApiError(400, "video not found")
    }

    const existingLike = await Like.findOne({ video:videoId, likedBy:req.user?._id })

    if(existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "video Unliked!"))
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

    const commentDoc = await Comment.findById(commentId);
    if (!commentDoc) {
        throw new ApiError(404, "Comment not found!");
    }

    const existingLike = await Like.findOne({ comment:commentId, likedBy:req.user?._id })

    if(existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "comment unliked!"))
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

    const tweetDoc = await Tweet.findById(tweetId);
    if(!tweetDoc) {
        throw new ApiError(400, "tweet not found")
    }

    const existingLike = await Like.findOne({ tweet:tweetId, likedBy:req.user?._id })

    if(existingLike) {
        await existingLike.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked!"))
    }

    const likedTweet = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "Tweet Liked!"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    
    if(!req.user) {
        throw new ApiError(400, "user should to be loggedIn")
    }

    const likedVideo = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
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
    ])

    if(!likedVideo.length) {
        throw new ApiError(400, "there is no liked videos")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, likedVideo, "liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}