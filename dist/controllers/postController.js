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
exports.editComment = exports.reportPostController = exports.likePost = exports.deletePost = exports.editPost = exports.getUserPost = exports.getPost = exports.addPost = void 0;
const postModel_1 = __importDefault(require("../models/post/postModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reportModel_1 = __importDefault(require("../models/reports/reportModel"));
const notificationSetter_1 = require("../utils/notificationSetter");
const notificationsModel_1 = __importDefault(require("../models/notifications/notificationsModel"));
const commentsModel_1 = __importDefault(require("../models/comments/commentsModel"));
// @desc    Create new post
// @route   POST /post/create-post
// @access  Public
exports.addPost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, imageUrl, title, description, hideLikes, hideComment } = req.body;
    console.log(userId, imageUrl, description, hideLikes, hideComment);
    if (!userId || !imageUrl || !description) {
        res.status(400);
        throw new Error("Provide all details");
    }
    const post = yield postModel_1.default.create({
        userId,
        imageUrl,
        title,
        description,
        hideComment,
        hideLikes,
    });
    if (!post) {
        res.status(400);
        throw new Error("Cannot add post");
    }
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 });
    if (posts.length == 0) {
        res.status(400);
        throw new Error("No Post available");
    }
    res.status(200).json({ message: "Post added successfully", posts: posts });
}));
// @desc    Get all Posts
// @route   get /post/get-post
// @access  Public
exports.getPost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;
    const posts = yield postModel_1.default.find({ isBlocked: false, isDeleted: false })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .populate({
        path: "likes",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
    const totalPosts = yield postModel_1.default.countDocuments({
        isBlocked: false,
        isDeleted: false,
    });
    const hasMore = totalPosts > skip + posts.length;
    res.status(200).json({ posts, hasMore });
}));
// @desc    Get User Posts
// @route   get /post/get-post
// @access  Public
exports.getUserPost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.body.userId;
    console.log(id);
    const posts = yield postModel_1.default.find({
        userId: id,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 });
    if (posts.length == 0) {
        res.status(400);
        throw new Error("No Post available");
    }
    res.status(200).json(posts);
}));
// @desc    Edit Post
// @route   POST /post/update-post
// @access  Public
exports.editPost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId, title, description, hideComment, hideLikes } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("Post cannot be found");
    }
    if (title)
        post.title = title;
    if (description)
        post.description = description;
    if (hideComment !== undefined)
        post.hideComment = hideComment;
    if (hideLikes !== undefined)
        post.hideLikes = hideLikes;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 });
    res.status(200).json(posts);
}));
// @desc    Delete Post
// @route   POST /post/delete-post
// @access  Public
exports.deletePost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    console.log(postId, userId);
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post Cannot be found");
    }
    post.isDeleted = true;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 });
    res.status(200).json({ posts });
}));
// @desc    Like Post
// @route   POST /post/like-post
// @access  Public
exports.likePost = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } }, { new: true });
        yield notificationsModel_1.default.findOneAndDelete({
            senderId: userId,
            receiverId: post.userId,
            message: "liked your post",
        });
    }
    else {
        const notificationData = {
            senderId: userId,
            receiverId: post.userId,
            message: "liked your post",
            link: `/visit-profile/posts/${post.userId}`,
            read: false,
            postId: postId,
        };
        (0, notificationSetter_1.createNotification)(notificationData);
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } }, { new: true });
    }
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .sort({ date: -1 });
    res.status(200).json({ posts });
}));
// @desc   Post Report
// @route   POST /post/Report-Post
// @access  Public
exports.reportPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId, cause } = req.body;
    const existingReport = yield reportModel_1.default.findOne({ userId, postId });
    if (existingReport) {
        res.status(400);
        throw new Error("You have already reported this post");
    }
    const report = new reportModel_1.default({
        userId,
        postId,
        cause,
    });
    yield report.save();
    const reportCount = yield reportModel_1.default.countDocuments({ postId });
    const REPORT_THRESHOLD = 3;
    if (reportCount >= REPORT_THRESHOLD) {
        yield postModel_1.default.findByIdAndUpdate(postId, { isBlocked: true });
        res.status(200).json({
            message: "Your Post has been blocked due to multiple reports",
        });
        return;
    }
    res.status(200).json({ message: "Post has been reported successfully" });
}));
// @desc    Edit a comment
// @route   PUT /post/edit-comment/:commentId
// @access  Private
// @desc    Edit a comment
// @route   POST /post/edit-comment/:commentId
// @access  Private
exports.editComment = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Edit comment request received");
    const { commentId } = req.params;
    const { comment } = req.body;
    if (!req.user) {
        res.status(401);
        throw new Error("User not authenticated");
    }
    const userId = req.user._id;
    console.log("Comment ID:", commentId);
    console.log("User ID:", userId);
    console.log("New comment text:", comment);
    const existingComment = yield commentsModel_1.default.findById(commentId);
    if (!existingComment) {
        console.log("Comment not found");
        res.status(404);
        throw new Error("Comment not found");
    }
    if (existingComment.userId.toString() !== userId.toString()) {
        console.log("User not authorized");
        res.status(403);
        throw new Error("User not authorized to edit this comment");
    }
    existingComment.comment = comment;
    yield existingComment.save();
    const updatedComments = yield commentsModel_1.default.find({
        postId: existingComment.postId,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "username profileImageUrl",
    })
        .populate({
        path: "replyComments.userId",
        select: "username profileImageUrl",
    });
    console.log("Comment updated successfully");
    res.status(200).json({
        message: "Comment updated successfully",
        comments: updatedComments,
    });
}));
