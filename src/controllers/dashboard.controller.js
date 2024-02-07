import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

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
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  let stats = {
   totalVideos: totalVideos,
   totalSubscribers:totalSubscribers,
   totalVideoViews:totalVideoViews[0]?.totalViews,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard state fetch"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelVideos = await Video.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        }
    ])

    if(!channelVideos){
        throw new ApiError(400, "Something went wrong")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,channelVideos,"Channels All Video Fetched Successfully"))
});

export { getChannelStats, getChannelVideos };
