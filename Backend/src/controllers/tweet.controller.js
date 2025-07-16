import { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(req.user){
        throw new ApiError(400, "user to be loggedIn first!")
    }

    if(!content) {
        throw new ApiError(400, "content is required")
    }
    
    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if(!tweet) {
        throw new ApiError(400, "Error while creating tweet")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet creataed successfully!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    
    if(!req.user) {
        throw new ApiError(400, "user to be loggedIn first")
    }

    const tweets = await Tweet.aggregate(
        {
            $match: {
                owner: req.user
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "TweetsByUser",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                        }
                    }
                ]
            }
        }
    )

    if(!tweets) {
        throw new ApiError(400, "There are no tweets")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid TweetId")
    }

    if(!content) {
        throw new ApiError(400, "Content is required!")
    }

    const tweet = Tweet.findOneAndUpdate(
        {
            _id: tweetId,
            owner: req.user?._id
        }, 
        {
            $set: content
        },
        { new: true, runValidators: true }
    )

    if(!tweet) {
        throw new ApiError(400, "tweet not found")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweet, "tweet Updated successfully!"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId!")
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user?._id
    })

    if(!tweet) {
        throw new ApiError(400, "There is no tweet or you are not allowed to update")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}