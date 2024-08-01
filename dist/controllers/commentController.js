"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedPostController = exports.savePostController = exports.addReplyComment = exports.deletePostComment = exports.addComment = exports.getCommentsByPostId = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const commentsModel_1 = __importDefault(require("../models/comments/commentsModel"));
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const jobModel_1 = __importDefault(require("../models/jobs/jobModel"));
const notificationSetter_1 = require("../utils/notificationSetter");
// @desc    Get all comments of a post
// @route   GET /post/get-comment
// @access  Private
exports.getCommentsByPostId = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    console.log(postId);
    const comments = yield commentsModel_1.default.find({ postId: postId, isDeleted: false }).populate({
        path: 'userId',
        select: 'username profileImageUrl',
    })
        .populate({
        path: 'replyComments.userId',
        select: 'username profileImageUrl',
    }).sort({ createdAt: -1 });
    res.status(200).json({ comments });
}));
// @desc    Add a comment
// @route   POST /post/add-comment
// @access  Private
exports.addComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId, comment } = req.body;
    const post = yield postModel_1.default.findById(postId);
    const newComment = yield commentsModel_1.default.create({
        postId,
        userId,
        comment,
    });
    const userIdObj = new mongoose_1.default.Types.ObjectId(userId);
    if (!userIdObj.equals(post === null || post === void 0 ? void 0 : post.userId)) {
        const notificationData = {
            senderId: userId,
            receiverId: post === null || post === void 0 ? void 0 : post.userId,
            message: 'commented on your post',
            link: `/visit-profile/posts/${post === null || post === void 0 ? void 0 : post.userId}`,
            read: false,
            postId: postId
        };
        (0, notificationSetter_1.createNotification)(notificationData);
    }
    yield newComment.save();
    const comments = yield commentsModel_1.default.find({ postId: postId, isDeleted: false }).populate({
        path: 'userId',
        select: 'username profileImageUrl',
    })
        .populate({
        path: 'replyComments.userId',
        select: 'username profileImageUrl',
    });
    res.status(200).json({ message: 'Comment added successfully', comments });
}));
// @desc    Delete a comment
// @route   POST /post/delete-comment
// @access  Private
exports.deletePostComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId } = req.query;
    console.log(req.query);
    const comment = yield commentsModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    yield comment.save();
    const comments = yield commentsModel_1.default.find({ postId: comment.postId, isDeleted: false }).populate({
        path: 'userId',
        select: 'username profileImageUrl',
    })
        .populate({
        path: 'replyComments.userId',
        select: 'username profileImageUrl',
    }).sort({ createdAt: -1 });
    res.status(200).json({ message: "Comment deleted successfully", comments });
}));
// @desc    reply comment
// @route   POST /post/reply-comment
// @access  Private 
exports.addReplyComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reached replu");
    const { commentId, userId, replyComment } = req.body;
    const comment = yield commentsModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }
    const newReplyComment = {
        userId,
        replyComment,
        timestamp: new Date(),
    };
    comment.replyComments.push(newReplyComment);
    yield comment.save();
    const comments = yield commentsModel_1.default.find({ postId: comment.postId, isDeleted: false }).populate({
        path: 'userId',
        select: 'username profileImageUrl',
    })
        .populate({
        path: 'replyComments.userId',
        select: 'username profileImageUrl',
    });
    res.status(200).json({ message: 'Reply comment added successfully', comments });
}));
// @desc    Save Post
// @route   POST /post/like-post
// @access  Public
exports.savePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, jobId, userId } = req.body;
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    if (postId) {
        const isSavedPosts = user.savedPosts.includes(postId);
        if (isSavedPosts) {
            yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $pull: { savedPosts: postId } }, { new: true });
        }
        else {
            yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $push: { savedPosts: postId } }, { new: true });
        }
    }
    if (jobId) {
        const isSavedJobs = user.savedJobs.includes(jobId);
        if (isSavedJobs) {
            yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $pull: { savedJobs: jobId } }, { new: true });
        }
        else {
            yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $push: { savedJobs: jobId } }, { new: true });
        }
    }
    const UpdatedUser = yield userModel_1.default.findOne({ _id: userId });
    res.status(201).json({ user: UpdatedUser });
}));
// @desc    Get User Saved Posts
// @route   get /post/get-saved-post
// @access  Public
exports.getSavedPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userId;
    const user = yield userModel_1.default.findOne({ _id: id, isBlocked: false }, { savedPosts: 1, savedJobs: 1, _id: 0 });
    if (user) {
        const savedPostIds = user.savedPosts;
        const posts = yield postModel_1.default.find({ _id: { $in: savedPostIds } }).populate("userId");
        const savedJobIds = user.savedJobs;
        const jobs = yield jobModel_1.default.find({ _id: { $in: savedJobIds } }).populate("userId");
        res.status(200).json({ posts, jobs });
    }
    else {
        res.status(400);
        throw new Error("User Not Found");
    }
}));
