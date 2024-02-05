import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Name field is required");
  }

  const playList = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  if (!playList) {
    throw new ApiError(400, "Something went wrong while playlist creation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  const playList = await Playlist.find({ owner: userId });

  if (!playList) {
    throw new ApiError(400, "Invalid User Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "PlayList Id is required");
  }

  const playList = await Playlist.findById(playlistId);

  if (!playList) {
    throw new ApiError(400, "Invalid Playlist Id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All parametar is required");
  }
  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playList) {
    throw new ApiError(400, "Something went wrong while db operation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All parametar is required");
  }
  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  if (!playList) {
    throw new ApiError(400, "Something went wrong while db operation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist Id is required");
  }

  const playList = await Playlist.findByIdAndDelete(playlistId);
  if (!playList) {
    throw new ApiError(400, "Something went wrong while db operation");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  if (!name) {
    throw new ApiError(400, "name field is required");
  }

  const playList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  if (!playList) {
    throw new ApiError(400, "Something went wrong while db operation");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
