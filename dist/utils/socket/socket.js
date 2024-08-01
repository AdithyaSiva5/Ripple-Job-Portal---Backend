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
Object.defineProperty(exports, "__esModule", { value: true });
const socketIo_Config = (io) => {
    let users = [];
    io.on("connect", (socket) => {
        console.log("A client connected");
        io.emit("welcome", "this is server hi socket");
        socket.on("disconnect", () => {
            console.log("A client disconnected");
        });
        const removeUser = (socketId) => {
            users = users.filter((user) => user.socketId !== socketId);
        };
        const addUser = (userId, socketId) => {
            !users.some((user) => user.userId === userId) &&
                users.push({ userId, socketId });
        };
        const getUser = (userId) => {
            return users.find((user) => user.userId === userId);
        };
        //when connect
        socket.on("addUser", (userId) => {
            addUser(userId, socket.id);
            io.emit("getUsers", users);
        });
        // send and get message
        socket.on("sendMessage", ({ senderId, receiverId, text, createdAt }) => {
            console.log(text, senderId, receiverId, createdAt);
            const user = getUser(receiverId);
            io.to(user === null || user === void 0 ? void 0 : user.socketId).emit("getMessage", {
                senderId,
                text,
                createdAt
            });
        });
        // Listen for "typing" event from client
        socket.on("typing", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userTyping", { senderId });
            }
        });
        // Listen for "stopTyping" event from client
        socket.on("stopTyping", ({ senderId, recieverId }) => {
            const user = getUser(recieverId);
            if (user) {
                io.to(user.socketId).emit("userStopTyping", { senderId });
            }
        });
        socket.on("joinGroup", (data) => {
            try {
                const { group_id, userId } = data;
                socket.join(group_id);
                console.log("Connected to the group", group_id, "by user", userId);
                socket
                    .to(group_id)
                    .emit("joinGroupResponse", {
                    message: "Successfully joined the group",
                });
            }
            catch (error) {
                console.error("Error occurred while joining group:", error);
            }
        });
        socket.on("GroupMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { group_id, sender_id, content, lastUpdate } = data;
            const datas = {
                group_id,
                sender_id,
                content,
                lastUpdate,
            };
            if (group_id) {
                const emitData = {
                    group_id,
                    sender_id,
                    content,
                };
                io.to(group_id).emit("responseGroupMessage", emitData);
            }
        }));
        socket.on("videoCallRequest", (data) => {
            const emitdata = {
                roomId: data.roomId,
                senderName: data.senderName,
                senderProfile: data.senderProfile
            };
            console.log(emitdata);
            const user = getUser(data.recieverId);
            if (user) {
                io.to(user.socketId).emit("videoCallResponse", emitdata);
            }
        });
        //Group Video Call 
        socket.on("GroupVideoCallRequest", (data) => {
            const emitdata = {
                roomId: data.roomId,
                groupName: data.groupName,
                groupProfile: data.groupProfile
            };
            io.to(data.groupId).emit("GroupVideoCallResponse", emitdata);
        });
        // When disconnectec
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.emit("getUsers", users);
        });
    });
};
exports.default = socketIo_Config;
