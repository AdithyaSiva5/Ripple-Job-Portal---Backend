"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const adminAuth_1 = require("../middlewares/adminAuth");
const router = express_1.default.Router();
router.post("/login", adminController_1.Login);
router.get("/get-users", adminAuth_1.protectAdmin, adminController_1.getUsers);
router.get("/get-posts", adminAuth_1.protectAdmin, adminController_1.getPosts);
router.get("/get-jobs", adminAuth_1.protectAdmin, adminController_1.getJobs);
router.post("/user-block", adminAuth_1.protectAdmin, adminController_1.userBlock);
router.post("/post-block", adminAuth_1.protectAdmin, adminController_1.postBlock);
router.post("/job-block", adminAuth_1.protectAdmin, adminController_1.jobBlock);
router.get("/job-category", adminAuth_1.protectAdmin, adminController_1.getJobCategory);
router.post("/add-job-category", adminAuth_1.protectAdmin, adminController_1.addJobCategory);
router.post("/block-job-category", adminAuth_1.protectAdmin, adminController_1.blockJobCategory);
router.get("/get-reports", adminAuth_1.protectAdmin, adminController_1.getReportsController);
router.get("/get-transactions", adminAuth_1.protectAdmin, adminController_1.getTransactionsController);
router.get("/chart-data", adminAuth_1.protectAdmin, adminController_1.chartDataController);
router.get("/dashboard-stats", adminAuth_1.protectAdmin, adminController_1.dashboardStatsController);
exports.default = router;
