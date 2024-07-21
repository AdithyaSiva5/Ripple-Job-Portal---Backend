import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Conversation from "../models/conversations/conversationsModel";
import Message from "../models/messages/messagesModel";

// @desc    Adda new conversation
// @route   get /chat/add-conversation 
// @access  Public

export const addConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const { senderId, receiverId } = req.body;
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate({
      path: "members",
      select: "username profileImageUrl ",
    });
    if (existConversation) {
      res.status(200).json(existConversation);
      return;
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    try {
      const savedConversation = await newConversation.save();
      const conversation = await Conversation.findById(
        savedConversation._id
      ).populate({
        path: "members",
        select: "username profileImageUrl ",
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public

export const getUserConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversation = await Conversation.find({
        members: { $in: [req.params.userId] },
      }).populate({
        path: 'members',
        select: 'username profileImageUrl'
      }).sort({updatedAt:-1});
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get conversations of two users
// @route   get /chat/get-conversation
// @access  Public

export const findConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);


// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public

export const addMessageController = asyncHandler(async (req: Request, res: Response) => {
  const newMessage = new Message(req.body);
  const { conversationId, text } = req.body;

  try {
    const savedMessage = await newMessage.save();
    const message = await Message.findById(savedMessage._id).populate('sender');
    const conversation = await Conversation.findById(conversationId);

    if (conversation) {
      conversation.lastMessage = text;
      await conversation.save();
    } else {
      throw new Error('Conversation not found');
    }

    res.status(200).json(message);
  } catch (err) {
    res.status(500).json(err);
  }
});

// @desc    Get User Message
// @route   get /chat/get-message
// @access  Public

export const getMessagesController = asyncHandler(async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    }).populate({
        path: 'sender',
        select: 'username profileImageUrl'
      });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});


// @desc    get Message ReadController
// @route   get /chat/get-message
// @access  Public




export const setMessageReadController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      console.log("Hisdfdsfsdfi")
      const { conversationId, userId } = req.body; 
      console.log(conversationId, userId + "Reading Messages"); 
      const messages = await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $set: { isRead: true } }
      );
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);


// @desc    get Unread Messages
// @route   get /chat/get-message
// @access  Public

export const getUnreadMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.body;
      console.log(conversationId, userId + "unreadMessages getting....");
      const messages = await Message.find({
        conversationId: conversationId,
        sender: { $ne: userId },
        isRead: false,
      });
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);