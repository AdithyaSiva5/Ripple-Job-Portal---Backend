import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Conversation from "../models/conversations/conversationsModel";
import Message from "../models/messages/messagesModel";

// @desc    Adda new conversation
// @route   get /chat/add-conversation
// @access  Public

export const addConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });

    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
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
      });
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

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
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