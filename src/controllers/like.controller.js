import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, {}, "Like removed successfully"));
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, {}, "Video liked successfully"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  console.log(commentId);
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, {}, "Like removed successfully"));
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment liked successfully"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }

  const existingLike = await Like.findOne({
    tweet: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.deleteOne({ tweet: commentId, likedBy: req.user._id });
    res.status(200).json(new ApiResponse(200, {}, "Like removed successfully"));
  } else {
    await Like.create({
      tweet: commentId,
      likedBy: req.user._id,
    });
    res.status(200).json(new ApiResponse(200, {}, "Tweet liked successfully"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const likedVideo = await Like.aggregatePaginate(
    Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "video",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullName: 1,
                      avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$owner",
            },
            {
                $project: {
                  video: 1,
                  thumbnail: 1,
                  title: 1,
                  description: 1,
                  duration: 1,
                  views: 1,
                },
              },
          ],
        },
      },
      {
        $unwind: "$video",
      },
    ]),
    {
      page: page,
      limit: limit,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Fetch liked video"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
