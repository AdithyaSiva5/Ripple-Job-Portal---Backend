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
exports.getFormSelectData = exports.userJobBlock = exports.cancelJobApplication = exports.getAllJobDetails = exports.employerApplications = exports.viewJob = exports.employeeApplications = exports.updateApplicationStatus = exports.addJobApplication = exports.jobDetails = exports.listUserJobs = exports.listActiveJobs = exports.editJob = exports.addJob = void 0;
const jobModel_1 = __importDefault(require("../models/jobs/jobModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const jobApplicationModel_1 = __importDefault(require("../models/jobApplication/jobApplicationModel"));
const notificationSetter_1 = require("../utils/notificationSetter");
//add Job
exports.addJob = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, companyName, jobRole, experience, salary, jobType, jobLocation, lastDateToApply, requiredSkills, jobDescription, qualification, } = req.body;
        const newJob = new jobModel_1.default({
            userId,
            companyName,
            jobRole,
            experience,
            salary,
            jobType,
            jobLocation,
            lastDateToApply,
            requiredSkills,
            jobDescription,
            qualification,
            isDeleted: false,
        });
        yield newJob.save();
        res.status(201).json({ message: 'Job added successfully', job: newJob });
    }
    catch (error) {
        console.error('Error adding job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
//editjob
exports.editJob = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId, companyName, jobRole, experience, salary, jobType, jobLocation, lastDateToApply, requiredSkills, jobDescription, qualification, } = req.body;
        const existingJob = yield jobModel_1.default.findById(jobId);
        if (!existingJob) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        existingJob.companyName = companyName;
        existingJob.jobRole = jobRole;
        existingJob.experience = experience;
        existingJob.salary = salary;
        existingJob.jobType = jobType;
        existingJob.jobLocation = jobLocation;
        existingJob.lastDateToApply = lastDateToApply;
        existingJob.requiredSkills = requiredSkills;
        existingJob.jobDescription = jobDescription;
        existingJob.qualification = qualification;
        yield existingJob.save();
        res.status(200).json({ message: 'Job updated successfully', job: existingJob });
    }
    catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
//list job
const listActiveJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, filterData } = req.body;
        const searchText = (filterData === null || filterData === void 0 ? void 0 : filterData.search) || '';
        const userApplications = yield jobApplicationModel_1.default.find({
            applicantId: userId,
            isDeleted: { $ne: true },
        }).distinct('jobId');
        const filterCriteria = {
            isDeleted: { $ne: true },
            userId: { $ne: userId },
            isAdminBlocked: false,
            isBlocked: false,
            // _id: { $nin: userApplications },
        };
        if (filterData) {
            if (filterData.jobRole) {
                filterCriteria.jobRole = filterData.jobRole;
            }
            if (filterData.location) {
                filterCriteria.jobLocation = filterData.location;
            }
            if (filterData.jobType) {
                filterCriteria.jobType = filterData.jobType;
            }
            if (filterData.salaryRange && filterData.salaryRange != 0) {
                const maxSalary = parseFloat(filterData.salaryRange);
                filterCriteria.salary = { $lte: maxSalary };
            }
            if (filterData.experienceRange && filterData.experienceRange != 0) {
                const maxExp = parseFloat(filterData.experienceRange);
                filterCriteria.experience = { $lte: maxExp };
            }
            if (searchText.trim() !== '' && searchText !== null) {
                filterCriteria.jobRole = { $regex: searchText.trim(), $options: 'i' };
            }
        }
        const jobs = yield jobModel_1.default.find(filterCriteria)
            .populate({ path: 'userId', select: 'username profileImageUrl' });
        res.status(200).json({ jobs });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listActiveJobs = listActiveJobs;
//list job
const listUserJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const jobs = yield jobModel_1.default.find({ userId: userId, isDeleted: { $ne: true } })
            .populate({
            path: 'userId',
            select: 'username profileImageUrl',
        })
            .exec();
        res.status(200).json({ jobs });
    }
    catch (error) {
        console.error('Error listing active jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.listUserJobs = listUserJobs;
//get job details
const jobDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId } = req.body;
        const job = yield jobModel_1.default.findOne({ _id: jobId, isDeleted: { $ne: true } })
            .populate({
            path: 'userId',
            select: 'username profileImageUrl',
        })
            .exec();
        res.status(200).json({ job });
    }
    catch (error) {
        console.error('Error listing active jobs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.jobDetails = jobDetails;
//add job application
const addJobApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { applicantId, jobId, applicationStatus, coverLetter, useExistingResume, } = req.body;
        let resume;
        if (useExistingResume === 'true') {
            const user = yield userModel_1.default.findById(applicantId);
            if (!user || !user.profile || !user.profile.resume) {
                res.status(400).json({ message: 'No existing resume found. Please upload a resume.' });
                return;
            }
            resume = user.profile.resume;
        }
        else {
            resume = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
            if (!resume) {
                res.status(400).json({ message: 'Please upload a resume.' });
                return;
            }
        }
        const existingApplication = yield jobApplicationModel_1.default.findOne({
            applicantId,
            jobId,
        });
        if (existingApplication) {
            res.status(400).json({ message: 'You have already applied for this job' });
            return;
        }
        const newJobApplication = new jobApplicationModel_1.default({
            applicantId,
            jobId,
            applicationStatus,
            coverLetter,
            resume,
        });
        yield newJobApplication.save();
        const job = yield jobModel_1.default.findOne({ _id: jobId });
        const notificationData = {
            senderId: applicantId,
            receiverId: job === null || job === void 0 ? void 0 : job.userId,
            message: `applied for the position of ${job === null || job === void 0 ? void 0 : job.jobRole} at ${job === null || job === void 0 ? void 0 : job.companyName}`,
            link: `/visit-profile/posts/`,
            read: false,
            jobId: jobId
        };
        (0, notificationSetter_1.createNotification)(notificationData);
        yield userModel_1.default.updateOne({ _id: applicantId }, { $inc: { dailyJobsApplied: 1 } });
        const user = yield userModel_1.default.findOne({ _id: applicantId });
        res.status(201).json({ message: 'Job application submitted', jobApplication: newJobApplication, user });
    }
    catch (error) {
        console.error('Error adding job application:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addJobApplication = addJobApplication;
//update application status
const updateApplicationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId, status, userId } = req.body;
        const jobApplication = yield jobApplicationModel_1.default.findById(applicationId).populate({
            path: 'jobId',
            select: 'userId'
        });
        if (!jobApplication) {
            res.status(404).json({ message: 'Job application not found' });
            return;
        }
        jobApplication.applicationStatus = status;
        yield jobApplication.save();
        const jobs = yield jobModel_1.default.find({ userId });
        const job = yield jobModel_1.default.findOne({ _id: jobApplication.jobId });
        const jobIds = jobs.map((job) => job._id);
        const applications = yield jobApplicationModel_1.default.find({ jobId: { $in: jobIds } })
            .populate({
            path: 'applicantId',
            select: 'username profileImageUrl profile.fullname profile.designation companyProfile.companyName',
        })
            .populate('jobId')
            .exec();
        const jobSpecificApplications = yield jobApplicationModel_1.default.find({ jobId: jobApplication.jobId }).populate('applicantId').populate('jobId')
            .exec();
        if (status == "Accepted") {
            const notificationData = {
                senderId: userId,
                receiverId: jobApplication.applicantId,
                message: 'accepted your job application',
                link: `/visit-profile/posts/`,
                read: false,
                applicationId: applicationId
            };
            (0, notificationSetter_1.createNotification)(notificationData);
        }
        else {
            const notificationData = {
                senderId: userId,
                receiverId: jobApplication.applicantId,
                message: 'rejected your job application',
                link: `/visit-profile/posts/`,
                read: false,
                applicationId: applicationId
            };
            (0, notificationSetter_1.createNotification)(notificationData);
        }
        res.status(200).json({ message: `Job application ${status} successfully`, applications, jobSpecificApplications });
    }
    catch (error) {
        console.error('Error accepting job application:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateApplicationStatus = updateApplicationStatus;
//get employee applications
const employeeApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicantId } = req.body;
        const applications = yield jobApplicationModel_1.default.find({ applicantId: applicantId })
            .populate({
            path: 'jobId',
            select: 'jobRole companyName jobLocation salary',
        })
            .exec();
        console.log(applications);
        res.status(200).json({ success: true, applications });
    }
    catch (error) {
        console.error('Error fetching employee applications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.employeeApplications = employeeApplications;
//viewjob
const viewJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId } = req.body;
        // Get job details
        const job = yield jobModel_1.default.findOne({ _id: jobId, isDeleted: { $ne: true } })
            .populate({
            path: 'userId',
            select: 'username profileImageUrl',
        })
            .exec();
        // Get job applications
        const applications = yield jobApplicationModel_1.default.find({ jobId,
            isDeleted: { $ne: true } }).populate('applicantId').populate('jobId')
            .exec();
        res.status(200).json({ success: true, job, applications });
    }
    catch (error) {
        console.error('Error fetching job and applications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.viewJob = viewJob;
//get employeer applications
const employerApplications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const jobs = yield jobModel_1.default.find({ userId });
        const jobIds = jobs.map((job) => job._id);
        const applications = yield jobApplicationModel_1.default.find({ jobId: { $in: jobIds } }).populate('applicantId').populate('jobId')
            .exec();
        res.status(200).json({ success: true, applications });
    }
    catch (error) {
        console.error('Error fetching employer applications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.employerApplications = employerApplications;
//get all job details
const getAllJobDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { jobId } = req.body;
        const job = yield jobModel_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({ success: false, message: 'Job not found' });
            return;
        }
        const applications = yield jobApplicationModel_1.default.find({ jobId })
            .populate({
            path: 'applicantId',
            select: 'username profileImageUrl profile.fullname profile.designation',
        })
            .exec();
        res.status(200).json({ success: true, job, applications });
    }
    catch (error) {
        console.error('Error fetching job details:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.getAllJobDetails = getAllJobDetails;
//cancel job application request
const cancelJobApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId, applicantId } = req.body;
        const jobApplication = yield jobApplicationModel_1.default.findById(applicationId);
        if (!jobApplication) {
            res.status(404).json({ message: 'Job application not found' });
            return;
        }
        jobApplication.isDeleted = !jobApplication.isDeleted;
        yield jobApplication.save();
        const applications = yield jobApplicationModel_1.default.find({ applicantId,
            isDeleted: { $ne: true } }).populate('applicantId').populate('jobId')
            .exec();
        res.status(200).json({ success: true, message: "Application Canceled", applications });
    }
    catch (error) {
        console.error('Error fetching employee applications:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.cancelJobApplication = cancelJobApplication;
// @desc    Block job
// @route   USER /user/block-user
// @access  Private
exports.userJobBlock = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.body.jobId;
    const job = yield jobModel_1.default.findById(jobId);
    if (!job) {
        res.status(400);
        throw new Error('Post not found');
    }
    const userId = job === null || job === void 0 ? void 0 : job.userId;
    job.isBlocked = !job.isBlocked;
    yield job.save();
    const jobs = yield jobModel_1.default.find({ userId: userId, isDeleted: { $ne: true } })
        .populate('userId')
        .exec();
    const blocked = job.isAdminBlocked ? "Blocked" : "Unblocked";
    res.status(200).json({ jobs, message: `Job has been ${blocked}` });
}));
const getFormSelectData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const distinctLocations = yield jobModel_1.default.distinct('jobLocation').sort();
        const distinctRoles = yield jobModel_1.default.distinct('jobRole').sort();
        res.status(200).json({ locations: distinctLocations, roles: distinctRoles });
    }
    catch (error) {
        console.error('Error fetching distinct job data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getFormSelectData = getFormSelectData;
