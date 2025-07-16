import { isValidObjectId } from "mongoose"
import { ApiError } from "../utils/ApiError"
import { Subscription } from "../models/subscription.model"
import { ApiResponse } from "../utils/ApiResponse"

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
    
    if(!req.user) {
        throw new ApiError(400, "Error: user should to be loggedIn!")
    }

    const TotalSubscribers = await Subscription.aggregate(
        {
            $match: {
                channel: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
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
    )

    if(!subscribers) {
        throw new ApiError(400, "there are no subscribers")
    }

    return res
      .status(200)
      .json(new ApiResponse(200, TotalSubscribers[0].subscribers, "fetched successfully"))
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId")
    }
    
    if(!req.user) {
        throw new ApiError(400, "Error: user should to be loggedIn!")
    }

    const TotalChannels = await Subscription.aggregate(
        {
            $match: {
                subscriber: subscriberId
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
    )

    if(!TotalChannels) {
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