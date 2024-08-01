"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chatController_1 = require("../controllers/chatController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
// Conversation Routes
router.post("/add-conversation", auth_1.protect, chatController_1.addConversationController);
router.get("/get-conversations/:userId", auth_1.protect, chatController_1.getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId", auth_1.protect, chatController_1.findConversationController);
// Messages Routes
router.post('/add-message', auth_1.protect, chatController_1.addMessageController);
router.get('/get-messages/:conversationId', auth_1.protect, chatController_1.getMessagesController);
router.post('/set-message-read', auth_1.protect, chatController_1.setMessageReadController);
router.post('/get-unread-messages', auth_1.protect, chatController_1.getUnreadMessagesController);
exports.default = router;
