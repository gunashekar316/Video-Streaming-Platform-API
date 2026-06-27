import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid videoId");

    const existingLike = await Like.findOne({ video: videoId, likedBy: req.user._id });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Removed like from video"));
    } else {
        await Like.create({ video: videoId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Liked video"));
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid commentId");

    const existingLike = await Like.findOne({ comment: commentId, likedBy: req.user._id });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Removed like from comment"));
    } else {
        await Like.create({ comment: commentId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Liked comment"));
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!isValidObjectId(tweetId)) throw new ApiError(400, "Invalid tweetId");

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.status(200).json(new ApiResponse(200, { liked: false }, "Removed like from tweet"));
    } else {
        await Like.create({ tweet: tweetId, likedBy: req.user._id });
        return res.status(200).json(new ApiResponse(200, { liked: true }, "Liked tweet"));
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likes = await Like.find({
        likedBy: req.user._id,
        video: { $exists: true, $ne: null }
    }).populate("video");

    const videos = likes.map(like => like.video);
    return res.status(200).json(new ApiResponse(200, videos, "Fetched liked videos successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}