import express from "express";
import {
  addConversationController,
  addMessageController,
  findConversationController, 
  getMessagesController,
  getUnreadMessagesController,
  getUserConversationController,
  setMessageReadController,
} from "../controllers/chatController";
import { protect } from "../middlewares/auth";

const router = express.Router();

// Conversation Routes
router.post("/add-conversation",protect, addConversationController);
router.get("/get-conversations/:userId",protect, getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId",protect,findConversationController);

// Messages Routes

router.post('/add-message',protect,addMessageController);
router.get('/get-messages/:conversationId',protect,getMessagesController)
router.patch('/set-message-read',protect,setMessageReadController);
router.post('/get-unread-messages',protect,getUnreadMessagesController)

export default router;