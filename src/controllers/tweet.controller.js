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
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }
  const tweet = await Tweet.find({ owner: userId });
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
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
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
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
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
