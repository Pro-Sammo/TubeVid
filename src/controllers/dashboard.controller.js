import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const totalVideos = await Video.countDocuments({ owner: req.user._id });

  const totalSubscribers = await Subscription.countDocuments({
    channel: req.user._id,
  });

  const totalVideoViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $unwind:"$owner"
    },
    {
      $group: {
        _id:null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);


  const totalVideoLikes = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "owner",
        as: "videos"
      }
    },
    {
      $lookup: {
        from: "likes",
        localField: "videos._id",
        foreignField: "video",
        as: "videos.likes"
      }
    },
    {
      $addFields: {
        "videos.likesCount": { $size: "$videos.likes" }
      }
    },
    {
      $group: {
        _id: "$_id",
        totalLikes: { $sum: "$videos.likesCount" },
      }
    }
  ]);

  let stats = {
    totalVideos: totalVideos,
    totalSubscribers: totalSubscribers,
    totalVideoViews: totalVideoViews.totalViews,
    totalLikes: totalVideoLikes[0].totalLikes,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard state fetch"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
  ]);

  if (!channelVideos) {
    throw new ApiError(400, "Something went wrong");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelVideos,
        "Channels All Video Fetched Successfully"
      )
    );
});

export { getChannelStats, getChannelVideos };
