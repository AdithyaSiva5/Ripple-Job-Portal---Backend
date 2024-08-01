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
exports.clearnotification = exports.getNotifications = void 0;
const notificationsModel_1 = __importDefault(require("../models/notifications/notificationsModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const connections = yield connectionModel_1.default.findOne({ userId });
        const userConnections = (connections === null || connections === void 0 ? void 0 : connections.connections) || [];
        const notifications = yield notificationsModel_1.default.find({
            receiverId: userId,
        })
            .sort({ _id: -1 })
            .populate({
            path: "senderId",
            select: "username profileImageUrl",
        });
        res.status(200).json({ notifications: notifications });
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
});
exports.getNotifications = getNotifications;
const clearnotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        yield notificationsModel_1.default.deleteMany({ receiverId: userId });
        res.status(200).json({ message: "All notifications cleared successfully" });
    }
    catch (error) {
        console.error("Error Clearing notifications:", error);
        res.status(500).json({ message: "Error Clearing notifications" });
    }
});
exports.clearnotification = clearnotification;
