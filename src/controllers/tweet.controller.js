import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Tweet field is required");
  }
  const tweet = await Tweet.create({ content: content, owner: req.user._id });

  if (!tweet) {
    throw new ApiError(400, "Something went wrong while db operation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User ID");
  }

  const tweet = await Tweet.aggregate([
    {
      $match:{
        owner:new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup:{
        from:"likes",
        localField:"_id",
        foreignField:"tweet",
        as:"like",
        pipeline:[
          {
            $project:{
              likedBy:1,
              createdAt:1,
              updatedAt:1
            }
          }
        ]
      }
    },
    {
      $addFields:{
        likesCount:{
          $size:"$like"
        },
        isLiked:{
          $cond:{
            if: {$in:[new mongoose.Types.ObjectId(req.user._id),"$like.likedBy"]},
            then:true,
            else:false
          }
        }
      }
    }
  ])
  if (!tweet) {
    throw new ApiError(400, "Something went wrong while db operation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(tweet)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }

  if (!content) {
    throw new ApiError(400, "Content field is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(400, "Something went wrong while db operation");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Something went wrong while db operation");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
