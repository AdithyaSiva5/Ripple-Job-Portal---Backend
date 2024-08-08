"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobController_1 = require("../controllers/jobController");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const auth_1 = require("../middlewares/auth");
const interviewController_1 = require("../controllers/interviewController");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage });
upload.any();
router.use((err, req, res, next) => {
    console.log(req);
    if (err instanceof multer_1.default.MulterError) {
        console.error("Multer error:", err);
        res.status(400).json({ error: "File upload failed", message: err.message });
    }
    else {
        console.error("Other error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.post("/add-job", auth_1.protect, jobController_1.addJob);
router.post("/edit-job", auth_1.protect, jobController_1.editJob);
router.post("/view-job", auth_1.protect, jobController_1.viewJob);
router.post("/list-all-job", auth_1.protect, jobController_1.listActiveJobs);
router.post("/list-user-job", auth_1.protect, jobController_1.listUserJobs);
router.post("/job-details", auth_1.protect, jobController_1.jobDetails);
router.post("/apply-job", upload.single("resume"), jobController_1.addJobApplication);
router.post("/update-application-status", auth_1.protect, jobController_1.updateApplicationStatus);
router.post("/get-applications-employee", auth_1.protect, jobController_1.employeeApplications);
router.post("/get-applications-empolyer", auth_1.protect, jobController_1.employerApplications);
router.post("/get-all-job-details", auth_1.protect, jobController_1.getAllJobDetails);
router.post("/cancel-job-application", auth_1.protect, jobController_1.cancelJobApplication);
router.post("/add-interview", auth_1.protect, interviewController_1.addInterview);
router.put("/edit-interview", auth_1.protect, interviewController_1.editInterview);
router.post("/set-interview-status", auth_1.protect, interviewController_1.setInterviewStatus);
router.post("/get-interviewee-interviews", auth_1.protect, interviewController_1.getInterviewsByIntervieweeId);
router.post("/get-interviewer-interviews", auth_1.protect, interviewController_1.getInterviewsByInterviewerId);
router.post("/get-job-interviews", auth_1.protect, interviewController_1.getInterviewsByJobId);
router.get("/form-select-data", auth_1.protect, jobController_1.getFormSelectData);
router.post("/block-job", jobController_1.userJobBlock);
exports.default = router;
