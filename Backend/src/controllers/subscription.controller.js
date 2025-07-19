import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose, { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const subscriptonExist = await Subscription.findOne({channel: channelId, subscriber: req.user?._id})

    if(subscriptonExist) {
        await subscriptonExist.deleteOne()
        return res
          .status(200)
          .json(new ApiResponse(200, {}, "Unsubscribed successfully!"))
    }

    const subscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })

    return res
      .status(200)
      .json(new ApiResponse(200, subscription, "subscribed successfully!"))  
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }

    const aggregationResult = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$subscriberDetails" },
        {
            $group: {
                _id: "$channel",
                allSubscribers: { $push: "$subscriberDetails" },
                subscribersCount: { $sum: 1 }
            }
        }
    ]);

    const data = aggregationResult[0] || {
        allSubscribers: [],
        subscribersCount: 0
    };

    return res
        .status(200)
        .json(new ApiResponse(200, {
            allSubscribers: data.allSubscribers,
            subscribersCount: data.subscribersCount
        }, "Fetched successfully")
    );
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    if(!req.user) {
        throw new ApiError(400, "Error: user should to be loggedIn!")
    }

    const TotalChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: req.user._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullname: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        }
    ])

    if(!TotalChannels.length) {
        throw new ApiError(400, "there are no channels you subscribed")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, TotalChannels[0].channels, "fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}