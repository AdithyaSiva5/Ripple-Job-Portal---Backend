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
exports.dashboardStatsController = exports.chartDataController = exports.getTransactionsController = exports.getReportsController = exports.jobBlock = exports.getJobs = exports.blockJobCategory = exports.getJobCategory = exports.addJobCategory = exports.postBlock = exports.userBlock = exports.getPosts = exports.getUsers = exports.Login = void 0;
const express_1 = __importDefault(require("express"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const router = express_1.default.Router();
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const adminModel_1 = __importDefault(require("../models/admin/adminModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const jobCategoryModel_1 = __importDefault(require("../models/jobCategory/jobCategoryModel"));
const jobModel_1 = __importDefault(require("../models/jobs/jobModel"));
const reportModel_1 = __importDefault(require("../models/reports/reportModel"));
const premiumModel_1 = __importDefault(require("../models/premium/premiumModel"));
const adminToken_1 = __importDefault(require("../utils/adminToken"));
// @desc    Admin Login
// @route   ADMIN /Admin/login
// @access  Public
exports.Login = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const admin = yield adminModel_1.default.findOne({ email });
    console.log(admin);
    if (admin && password === admin.password) {
        res.status(200).json({
            message: "Login Successful",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: (0, adminToken_1.default)(admin.id),
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
}));
// @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public
exports.getUsers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.default.find({});
    if (users) {
        res.status(200).json({ users });
    }
    else {
        res.status(404);
        throw new Error("Users Not Found");
    }
}));
// @desc    Get all posts
// @route   ADMIN /admin/get-posts
// @access  Public
exports.getPosts = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const posts = yield postModel_1.default.find({ isBlocked: false, isDeleted: false }).populate({
        path: 'userId',
        select: ' username profileImageUrl email'
    });
    if (posts) {
        res.status(200).json({ posts });
    }
    else {
        res.status(404);
        throw new Error(" No Post Found");
    }
}));
// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public
exports.userBlock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    console.log(req.body);
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(400);
        throw new Error('User not found');
    }
    user.isBlocked = !user.isBlocked;
    yield user.save();
    const users = yield userModel_1.default.find({});
    const blocked = user.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ users, message: `You have ${blocked} ${user.username}` });
}));
// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public
exports.postBlock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    const post = yield postModel_1.default.findById(postId);
    console.log(postId);
    if (!post) {
        res.status(400);
        throw new Error('Post not found');
    }
    post.isBlocked = !post.isBlocked;
    yield post.save();
    const posts = yield postModel_1.default.find({});
    const blocked = post.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ posts, message: `post has been ${blocked}` });
}));
// @desc    Add job category
// @route   ADMIN /admin/get-users
// @access  Public
exports.addJobCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobCategory } = req.body;
    const existingJobCategory = yield jobCategoryModel_1.default.find({ jobCategory });
    if (existingJobCategory.length > 0) {
        res.status(404);
        throw new Error("Job category Already Exist");
    }
    else {
        yield jobCategoryModel_1.default.create({ jobCategory });
        const allJobCategory = yield jobCategoryModel_1.default.find({}).sort({ date: -1 });
        res.status(200).json({ message: "Job cateory added", jobCategory: allJobCategory });
    }
}));
// @desc    Get all job Categoory
// @route   ADMIN /admin/get-users
// @access  Public
exports.getJobCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobCategory = yield jobCategoryModel_1.default.find({}).sort({ date: -1 });
    ;
    if (jobCategory) {
        res.status(200).json({ jobCategory });
    }
    else {
        res.status(404);
        throw new Error(" No Job category Found");
    }
}));
// @desc     block job Category 
// @route   ADMIN /admin/block-job-category
// @access  Public
exports.blockJobCategory = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobCategoryId = req.body.jobCategoryId;
    console.log(req.body);
    const jobCategory = yield jobCategoryModel_1.default.findById(jobCategoryId);
    if (!jobCategory) {
        res.status(400);
        throw new Error('Category not found');
    }
    jobCategory.isBlocked = !jobCategory.isBlocked;
    yield jobCategory.save();
    const allJobCategory = yield jobCategoryModel_1.default.find({}).sort({ date: -1 });
    const blocked = jobCategory.isBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ allJobCategory, message: `You have ${blocked} ${jobCategory.jobCategory}` });
}));
// @desc    Get all posts
// @route   ADMIN /admin/get-posts
// @access  Private
exports.getJobs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const totalJobs = yield jobModel_1.default.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(totalJobs / limit);
    const jobs = yield jobModel_1.default.find({ isDeleted: false })
        .populate('userId')
        .skip(skip)
        .limit(limit);
    if (jobs.length > 0) {
        res.status(200).json({ jobs, totalPages });
    }
    else {
        res.status(404).json({ message: "No Jobs Found" });
    }
}));
// @desc    Block job
// @route   ADMIN /admin/block-user
// @access  Private
exports.jobBlock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.body.jobId;
    const job = yield jobModel_1.default.findById(jobId);
    if (!job) {
        res.status(400);
        throw new Error('Post not found');
    }
    job.isAdminBlocked = !job.isAdminBlocked;
    yield job.save();
    const jobs = yield jobModel_1.default.find({ isDeleted: false }).populate('userId');
    const blocked = job.isAdminBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ jobs, message: `Job has been ${blocked}` });
}));
// @desc    Get all reports
// @route   ADMIN /admin/get-posts
// @access  Private
exports.getReportsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const totalPosts = yield postModel_1.default.countDocuments({ isDeleted: false });
    const totalPages = Math.ceil(totalPosts / limit);
    const reports = yield reportModel_1.default.find()
        .populate({
        path: 'userId',
        select: 'username profileImageUrl email'
    })
        .populate({
        path: 'postId',
        populate: {
            path: 'userId',
            select: 'username profileImageUrl email'
        }
    })
        .skip(skip)
        .limit(limit);
    if (reports.length > 0) {
        res.status(200).json({ reports, totalPages });
    }
    else {
        res.status(404).json({ message: "No Data Found" });
    }
}));
// @desc    get Transactions
// @route   ADMIN /admin/transactions
// @access  Public
exports.getTransactionsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;
    const totalTransactions = yield premiumModel_1.default.countDocuments({});
    const totalPages = Math.ceil(totalTransactions / limit);
    const transactions = yield premiumModel_1.default.find()
        .populate({
        path: "userId",
        select: "username profileImageUrl email isPremium",
    }).skip(skip).limit(limit);
    if (transactions.length > 0) {
        res.status(200).json({ transactions, totalPages });
    }
    else {
        res.status(404).json({ message: "Transactions Not Found" });
    }
}));
// @desc    Chart Data
// @route   ADMIN /admin/chart-data
// @access  Public
exports.chartDataController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    fourMonthsAgo.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const generateDateRange = (start, end) => {
        const dates = [];
        let currentDate = new Date(start);
        while (currentDate <= end) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };
    const dateRange = generateDateRange(fourMonthsAgo, today);
    const userJoinStats = yield userModel_1.default.aggregate([
        {
            $match: {
                createdAt: { $gte: fourMonthsAgo, $lte: today }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                userCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const postCreationStats = yield postModel_1.default.aggregate([
        {
            $match: {
                date: { $gte: fourMonthsAgo, $lte: today }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                postCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const jobCreationStats = yield jobModel_1.default.aggregate([
        {
            $match: {
                createdAt: { $gte: fourMonthsAgo, $lte: today }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                jobCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const fillMissingDates = (stats, dateField) => {
        const statsMap = new Map(stats.map(item => [item._id, item]));
        return dateRange.map(date => {
            const dateString = date.toISOString().split('T')[0];
            return statsMap.get(dateString) || { _id: dateString, [dateField]: 0 };
        });
    };
    const chartData = {
        userJoinStats: fillMissingDates(userJoinStats, 'userCount'),
        postCreationStats: fillMissingDates(postCreationStats, 'postCount'),
        jobCreationStats: fillMissingDates(jobCreationStats, 'jobCount'),
    };
    res.json(chartData);
}));
// @desc    Dashboard Stats
// @route   ADMIN /admin/dashboard-stats
// @access  Public
exports.dashboardStatsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsers = yield userModel_1.default.countDocuments();
    const totalPosts = yield postModel_1.default.countDocuments();
    const totalJobs = yield jobModel_1.default.countDocuments();
    const totalSales = yield premiumModel_1.default.countDocuments();
    const totalJobsCategories = yield jobCategoryModel_1.default.countDocuments();
    const totalReports = yield reportModel_1.default.countDocuments();
    const stats = {
        totalUsers,
        totalPosts,
        totalJobs,
        totalSales,
        totalJobsCategories,
        totalReports,
    };
    res.status(200).json(stats);
}));
