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
exports.getUnreadMessagesController = exports.setMessageReadController = exports.getMessagesController = exports.addMessageController = exports.findConversationController = exports.getUserConversationController = exports.addConversationController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const conversationsModel_1 = __importDefault(require("../models/conversations/conversationsModel"));
const messagesModel_1 = __importDefault(require("../models/messages/messagesModel"));
// @desc    Adda new conversation
// @route   get /chat/add-conversation 
// @access  Public
exports.addConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { senderId, receiverId } = req.body;
    const existConversation = yield conversationsModel_1.default.findOne({
        members: { $all: [senderId, receiverId] },
    }).populate({
        path: "members",
        select: "username profileImageUrl ",
    });
    if (existConversation) {
        res.status(200).json(existConversation);
        return;
    }
    const newConversation = new conversationsModel_1.default({
        members: [senderId, receiverId],
    });
    try {
        const savedConversation = yield newConversation.save();
        const conversation = yield conversationsModel_1.default.findById(savedConversation._id).populate({
            path: "members",
            select: "username profileImageUrl ",
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public
exports.getUserConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversationsModel_1.default.find({
            members: { $in: [req.params.userId] },
        }).populate({
            path: 'members',
            select: 'username profileImageUrl'
        }).sort({ updatedAt: -1 });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get conversations of two users
// @route   get /chat/get-conversation
// @access  Public
exports.findConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield conversationsModel_1.default.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public
exports.addMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newMessage = new messagesModel_1.default(req.body);
    const { conversationId, text } = req.body;
    try {
        const savedMessage = yield newMessage.save();
        const message = yield messagesModel_1.default.findById(savedMessage._id).populate('sender');
        const conversation = yield conversationsModel_1.default.findById(conversationId);
        if (conversation) {
            conversation.lastMessage = text;
            yield conversation.save();
        }
        else {
            throw new Error('Conversation not found');
        }
        res.status(200).json(message);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get User Message
// @route   get /chat/get-message
// @access  Public
exports.getMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const messages = yield messagesModel_1.default.find({
            conversationId: req.params.conversationId,
        }).populate({
            path: 'sender',
            select: 'username profileImageUrl'
        });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    get Message ReadController
// @route   get /chat/get-message
// @access  Public
exports.setMessageReadController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Hisdfdsfsdfi");
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "Reading Messages");
        const messages = yield messagesModel_1.default.updateMany({ conversationId: conversationId, sender: { $ne: userId } }, { $set: { isRead: true } });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    get Unread Messages
// @route   get /chat/get-message
// @access  Public
exports.getUnreadMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "unreadMessages getting....");
        const messages = yield messagesModel_1.default.find({
            conversationId: conversationId,
            sender: { $ne: userId },
            isRead: false,
        });
        console.log(messages);
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
