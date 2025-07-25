import { asyncHandler } from "../utils/asyncHandler";
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";


const getVideoComments = asyncHandler( async (req, res) => {
    // 1. get content,commentedBy
    // 2. validate if content is not empty
    // 3. get videoId and owner
    const {content} = req.body
    const {videoId} = req.params
    const comment = await Comment.create({
        content,
        videoId: videoId.url,
        owner: User._id,
        commentedBy
    })
})