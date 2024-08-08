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
exports.searchAllCollections = void 0;
const userModel_1 = __importDefault(require("../models/user/userModel"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const jobModel_1 = __importDefault(require("../models/jobs/jobModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.searchAllCollections = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchQuery = req.query.searchQuery;
        console.log(searchQuery);
        const users = yield userModel_1.default.find({
            $or: [
                { username: { $regex: searchQuery, $options: 'i' } },
                { email: { $regex: searchQuery, $options: 'i' } },
            ],
        });
        const posts = yield postModel_1.default.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } },
            ],
        }).populate("userId");
        ;
        const jobs = yield jobModel_1.default.find({
            $or: [
                { companyName: { $regex: searchQuery, $options: 'i' } },
                { jobRole: { $regex: searchQuery, $options: 'i' } },
                { jobLocation: { $regex: searchQuery, $options: 'i' } },
                { requiredSkills: { $regex: searchQuery, $options: 'i' } },
                { jobDescription: { $regex: searchQuery, $options: 'i' } },
                { qualification: { $regex: searchQuery, $options: 'i' } },
            ],
        });
        res.status(200).json({ users, posts, jobs });
    }
    catch (error) {
        console.error('Error searching collections:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
