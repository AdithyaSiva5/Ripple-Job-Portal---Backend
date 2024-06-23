import express from "express";
import {
  addConversationController,
  addMessageController,
  findConversationController,
  getMessagesController,
  getUserConversationController,
} from "../controllers/chatController";

const router = express.Router();

// Conversation Routes
router.post("/add-conversation", addConversationController);
router.get("/get-conversations/:userId", getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId",findConversationController);

// Messages Routes

router.post('/add-message',addMessageController);
router.get('/get-messages/:conversationId',getMessagesController)

export default router;