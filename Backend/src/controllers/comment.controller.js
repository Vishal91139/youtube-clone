import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const getVideoComments = asyncHandler(async (req, res) => {
    
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video Id!!")
    }

    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        // {
        //     $lookup: {
        //         from: "videos",
        //         localField: "video",
        //         foreignField: "_id",
        //         as: "commentOnWhichVideo"
        //     }
        // }, 
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerOfComment",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                content: 1,
                owner: {
                    $arrayElemAt : ["$ownerOfComment",0]
                },
                createdAt: 1
            }
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    if(!comments.length) {
        throw new ApiError(400, "comments are not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params
    const { content } = req.body

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoID is Invalid!!")
    }

    if(!content) {
        throw new ApiError(400, "comment is required")
    }

    if(!req.user) {
        throw new ApiError(400, "user should to be logged in")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if(!newComment) {
        throw new ApiError(400, "something went wrong while adding comment")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, newComment, "comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    
    const { commentId } = req.params
    const { content } = req.body

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId!!")
    }

    if(!content){
        throw new ApiError(400, "There should be content!")
    }

    const comment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user?._id
        },
        {
            $set: {
                content
            }
        },
        { new : true, runValidators: true}
    )

    if(!comment) {
        throw new ApiError(400, "comment not found or u are not aloowed to update!!")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, comment, "comment updated successfully!"))
})

const deleteComment = asyncHandler(async (req, res) => {
    
    const { commentId } = req.params

    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId!")
    }

    const comment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user?._id
        }
    )

    if(!comment) {
        throw new ApiError(400, "comment not found or else are not allowed to delete!")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment deleted successfully!"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}