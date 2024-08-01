"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connectionController_1 = require("../controllers/connectionController");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
router.post('/follow', auth_1.protect, connectionController_1.followUser);
router.post('/unfollow', auth_1.protect, connectionController_1.unFollowUser);
router.post('/accept-request', auth_1.protect, connectionController_1.acceptRequest);
router.post('/reject-request', auth_1.protect, connectionController_1.rejectRequest);
router.post('/get-requested-users', auth_1.protect, connectionController_1.getFollowRequests);
router.post('/get-connection', auth_1.protect, connectionController_1.getConnection);
router.post('/cancel-request', auth_1.protect, connectionController_1.cancelFollowRequest);
exports.default = router;
