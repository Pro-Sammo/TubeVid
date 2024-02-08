import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

export const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }
  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (!existingSubscription) {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
    return res.status(200).json(new ApiResponse(200, {}, "Channel subscribed Successfully"));
  } else {
    await Subscription.deleteOne({
      channel: channelId,
      subscriber: req.user._id,
    });

    return res.status(200).json(new ApiResponse(200, {}, "Channel unsubscribed Successfully"));
  }
});

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const subscribersList = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscriber",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $unwind:"$user"
          },
          {
            $project: {
              _id:"$user._id",
              username:"$user.username",
              fullName:"$user.fullName",
              avatar:"$user.avatar"
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscribers: {
          $first: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribersList[0].subscriber,
        "Fetch all the subscribers"
      )
    );
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }
  const AllSubscribedChannel = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "channel",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "channel",
              foreignField: "_id",
              as: "channel",
            },
          },
          {
            $unwind: "$channel",
          },
          {
            $project: {
              _id: "$channel._id",
              username: "$channel.username",
              fullName: "$channel.fullName",
              avatar: "$channel.avatar",
            },
          },
        ],
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        AllSubscribedChannel[0].channel,
        "Fetch all the channel"
      )
    );
});
