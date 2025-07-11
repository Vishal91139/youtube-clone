import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { Video } from "../models/video.model";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ApiResponse } from "../utils/ApiResponse";

const getAllVideos = asyncHandler(async(req, res) => {
    const {
        page = 1, 
        limit = 10, 
        query, 
        sortBy = "createdAt", 
        sortType = "desc", 
        userId 
    } = req.query

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" }} : {}),
        ...(userId ? { owner: mongoose.Types.ObjectId(userId)} : {})
    }

    const videos = await Video.aggregate([
        {
            $match: match
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner"
            }
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    $arrayElemAt: ["videosByOwner",0]
                }
            }
        },
        {
            $sort: {
                [sortBy]: sortType === 'desc' ? -1 : 1
            }
        },
        {
            $skip: (page - 1) * parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        }
    ])

    if (!videos?.length) {
      throw new ApiError(404, "Videos are not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    if(!title) {
        throw new ApiError(400, "title is required")
    }
    
    if(!description) {
        throw new ApiError(400, "description is required")
    }

    const videoFileLocalPath = req.files?.videoFile[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path

    if(!videoFileLocalPath) {
        throw new ApiError(400, "videoFile is required")
    }

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "videoFile is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!videoFile) {
        throw new ApiError(400, "Cloudinary error : videoFile is required")
    }

    if(!thumbnail) {
        throw new ApiError(400, "Cloudinary error : thumbnail is required")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user?._id
    })

    if(!video) {
        throw new ApiError(400, "Error while publishing a video")
    }

    return res
      .status(201)
      .json( new ApiResponse(200, video, "video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid video ID")
    }

    const video = await Video.findById(videoId).populate("owner", "name email")

    if(!video) {
        throw new ApiError(404, "video not found")
    }

    return res
      .status(200)
      .json( new ApiResponse(200, video, "video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body;

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not valid")
    }

    let updateData = { title, description }

    if(req.file) {
        const thumbnailLocalPath = req.file.path
    
        if(!thumbnailLocalPath) {
            throw new ApiError(400, "thumbnail is missing")
        } 

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!thumbnail.url){
            throw new ApiError(400, "Cloudinary error : thumbnail not uploaded")
        }

        updateData.thumbnail = thumbnail.url
    }

    const updatedVideo = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user?._id, 
        },
        {
            $set: updateData
        },
        { new : true, runValidators: true }
    )

    if (!updatedVideo) {
        throw new ApiError(403, "You are not allowed to update this video or video not found");
    }

    return res
     .status(200)
     .json(new ApiResponse(200, updatedVideo, "video updated!!"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId!!!")
    }

    const deletedVideo = await Video.findOneAndDelete(
        {
            _id: videoId,
            owner: req.user?._id
        }
    )

    if (!deletedVideo) {
    throw new ApiError(403, "You are not allowed to delete this video or video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(400, "video not found!!")
    }

    video.isPublished = !video.isPublished

    await video.save();

    return res
      .status(200)
      .json( new ApiResponse(200, video, "video publish status toggled successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}