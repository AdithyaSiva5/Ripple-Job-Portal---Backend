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
exports.protectAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/admin/adminModel"));
const protectAdmin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    else if ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token) {
        token = req.cookies.token;
    }
    if (!token) {
        res.status(401);
        return next(new Error("Not authorized, no token"));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            res.status(403);
            return next(new Error("Not authorized, admin access required"));
        }
        const admin = yield adminModel_1.default.findById(decoded.id).select("-password");
        if (!admin) {
            res.status(401);
            return next(new Error("Not authorized, admin not found"));
        }
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error("JWT verification error:", error);
        res.status(401);
        next(new Error("Not authorized, invalid token"));
    }
}));
exports.protectAdmin = protectAdmin;
