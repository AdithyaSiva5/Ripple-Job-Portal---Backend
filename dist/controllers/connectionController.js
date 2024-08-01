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
exports.cancelFollowRequest = exports.acceptRequest = exports.rejectRequest = exports.unFollowUser = exports.followUser = exports.getFollowRequests = exports.getConnection = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const notificationSetter_1 = require("../utils/notificationSetter");
exports.getConnection = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    res.status(200).json({ connection: connection });
}));
exports.getFollowRequests = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const requests = yield connectionModel_1.default.findOne({ userId }).populate({
        path: "requested",
        select: "username profileImageUrl",
    });
    res.status(200).json({ requests: requests === null || requests === void 0 ? void 0 : requests.requested });
}));
exports.followUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, followingUser } = req.body;
    console.log(userId, followingUser);
    const followingUserInfo = yield userModel_1.default.findById(followingUser);
    let followed = false;
    if (!followingUserInfo) {
        res.status(400);
        throw new Error("User not found");
    }
    yield connectionModel_1.default.findOneAndUpdate({ userId: followingUser }, { $addToSet: { requested: userId } }, { upsert: true });
    yield connectionModel_1.default.findOneAndUpdate({ userId }, { $addToSet: { requestSent: followingUser } }, { upsert: true });
    const notificationData = {
        senderId: userId,
        receiverId: followingUser,
        message: 'requested to connect',
        link: `/visit-profile/posts/`,
        read: false,
    };
    (0, notificationSetter_1.createNotification)(notificationData);
    const followingUserConnections = yield connectionModel_1.default.find({
        userId: followingUser,
    });
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    res
        .status(200)
        .json({ success: true, message: "User followed successfully", followed, connection: connection });
}));
exports.unFollowUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, unfollowingUser } = req.body;
    yield connectionModel_1.default.findOneAndUpdate({ userId: unfollowingUser }, { $pull: { connections: userId, requestSent: userId } });
    yield connectionModel_1.default.findOneAndUpdate({ userId }, { $pull: { connections: unfollowingUser, requested: unfollowingUser } });
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    res
        .status(200)
        .json({ success: true, message: "User unfollowed successfully", connection: connection });
}));
exports.rejectRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, requestedUser } = req.body;
    yield connectionModel_1.default.findOneAndUpdate({ userId }, {
        $pull: { requested: requestedUser },
    }, { new: true });
    yield connectionModel_1.default.findOneAndUpdate({ userId: requestedUser }, {
        $pull: { requestSent: userId },
    }, { new: true });
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    res
        .status(200)
        .json({ success: true, message: "Follow request rejected successfully", connection: connection });
}));
exports.acceptRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, requestedUser } = req.body;
    yield connectionModel_1.default.findOneAndUpdate({ userId }, {
        $pull: { requested: requestedUser },
        $addToSet: { connections: requestedUser },
    }, { new: true });
    yield connectionModel_1.default.findOneAndUpdate({ userId: requestedUser }, {
        $pull: { requestSent: userId },
        $addToSet: { connections: userId },
    }, { new: true });
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    const notificationData = {
        senderId: userId,
        receiverId: requestedUser,
        message: 'accepted your request',
        link: `/visit-profile/posts/`,
        read: false,
    };
    (0, notificationSetter_1.createNotification)(notificationData);
    res
        .status(200)
        .json({ success: true, message: "Follow request accepted successfully", connection: connection });
}));
exports.cancelFollowRequest = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, cancelingUser } = req.body;
    yield connectionModel_1.default.findOneAndUpdate({ userId }, { $pull: { requestSent: cancelingUser } });
    yield connectionModel_1.default.findOneAndUpdate({ userId: cancelingUser }, { $pull: { requested: userId } });
    const connection = yield connectionModel_1.default.findOne({ userId }).populate('connections')
        .populate('requested')
        .populate('requestSent');
    res.status(200).json({ success: true, message: "Follow request canceled successfully", connection: connection });
}));
