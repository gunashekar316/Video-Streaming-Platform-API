import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    const pipeline = [];

    // Match query in title or description
    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        });
    }

    // Match by user if userId is provided
    if (userId) {
        if (!isValidObjectId(userId)) throw new ApiError(400, "Invalid user ID");
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        });
    }

    // Sort
    if (sortBy && sortType) {
        pipeline.push({
            $sort: { [sortBy]: sortType === "desc" ? -1 : 1 }
        });
    } else {
        pipeline.push({ $sort: { createdAt: -1 } });
    }

    pipeline.push({
        $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "ownerDetails",
            pipeline: [
                { $project: { username: 1, avatar: 1, fullName: 1 } }
            ]
        }
    }, {
        $addFields: { owner: { $first: "$ownerDetails" } }
    });

    const aggregate = Video.aggregate(pipeline);
    const options = { page: parseInt(page, 10), limit: parseInt(limit, 10) };
    const videos = await Video.aggregatePaginate(aggregate, options);

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if ([title, description].some(f => !f?.trim())) throw new ApiError(400, "Title and description are required");

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    if (!videoLocalPath) throw new ApiError(400, "Video file is required");
    if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail file is required");

    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoUpload) throw new ApiError(500, "Failed to upload video to Cloudinary");
    if (!thumbnailUpload) throw new ApiError(500, "Failed to upload thumbnail to Cloudinary");

    const video = await Video.create({
        title,
        description,
        duration: videoUpload.duration || 0,
        videoFile: videoUpload.url,
        thumbnail: thumbnailUpload.url,
        owner: req.user?._id,
        isPublished: true
    });

    return res.status(201).json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId).populate("owner", "fullName username avatar");
    if (!video) throw new ApiError(404, "Video not found");

    return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    const thumbnailLocalPath = req.file?.path;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You do not have permission to edit this video");

    if (title) video.title = title;
    if (description) video.description = description;

    if (thumbnailLocalPath) {
        const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
        if (!thumbnailUpload) throw new ApiError(500, "Failed to upload new thumbnail");
        video.thumbnail = thumbnailUpload.url;
    }

    await video.save();
    return res.status(200).json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You do not have permission to delete this video");

    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    if (video.owner.toString() !== req.user._id.toString()) throw new ApiError(403, "You do not have permission to modify this video");

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200, video, "Video publish status toggled successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
