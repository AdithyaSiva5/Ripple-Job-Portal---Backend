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
exports.getInterviewsByJobId = exports.getInterviewsByIntervieweeId = exports.getInterviewsByInterviewerId = exports.setInterviewStatus = exports.editInterview = exports.addInterview = void 0;
const interviewModel_1 = __importDefault(require("../models/interview/interviewModel"));
const jobApplicationModel_1 = __importDefault(require("../models/jobApplication/jobApplicationModel"));
const jobModel_1 = __importDefault(require("../models/jobs/jobModel"));
// Controller function to add an interview
const addInterview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { applicationId, jury, interviewDate, interviewTime, status = 'Pending', } = req.body;
        const application = yield jobApplicationModel_1.default.findById(applicationId);
        if (!application) {
            return res.status(404).json({ message: 'Job application not found' });
        }
        const job = yield jobModel_1.default.findById(application.jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        function randomID(len) {
            let result = '';
            if (result)
                return result;
            const chars = '12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP', maxPos = chars.length;
            len = len || 5;
            for (let i = 0; i < len; i++) {
                result += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return result;
        }
        const intervieweeId = application.applicantId;
        const jobId = application.jobId;
        const interviewerId = job.userId;
        const interviewLink = randomID(10);
        const newInterview = new interviewModel_1.default({
            interviewerId,
            intervieweeId,
            applicationId,
            jobId,
            jury: [...jury],
            interviewDate,
            interviewTime,
            interviewLink,
            status,
        });
        const savedInterview = yield newInterview.save();
        yield jobApplicationModel_1.default.findByIdAndUpdate(applicationId, { isInterviewScheduled: true });
        const jobs = yield jobModel_1.default.find({ userId: interviewerId });
        const jobIds = jobs.map((job) => job._id);
        const applications = yield jobApplicationModel_1.default.find({ jobId: { $in: jobIds } })
            .populate('applicantId').populate('jobId')
            .exec();
        res.status(201).json({ message: 'Interview scheduled successfully', interview: savedInterview, applications: applications });
    }
    catch (error) {
        console.error('Error adding interview:', error);
        res.status(500).json({ message: 'Error adding interview' });
    }
});
exports.addInterview = addInterview;
// Controller function to edit an interview
const editInterview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.body;
        const { jury, interviewDate, interviewTime, status, } = req.body;
        const existingInterview = yield interviewModel_1.default.findById(id);
        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        existingInterview.jury = jury;
        existingInterview.interviewDate = interviewDate;
        existingInterview.interviewTime = interviewTime;
        existingInterview.status = status || existingInterview.status;
        const updatedInterview = yield existingInterview.save();
        res.status(200).json({ message: 'Interview updated successfully', interview: updatedInterview });
    }
    catch (error) {
        console.error('Error editing interview:', error);
        res.status(500).json({ message: 'Error editing interview' });
    }
});
exports.editInterview = editInterview;
// Controller function to change the status of an interview
const setInterviewStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, interviewId } = req.body;
        const existingInterview = yield interviewModel_1.default.findById(interviewId);
        if (!existingInterview) {
            res.status(404).json({ message: 'Interview not found' });
            return;
        }
        existingInterview.status = status;
        const updatedInterview = yield existingInterview.save();
        res.status(200).json({ message: 'Interview status updated successfully', interview: updatedInterview });
    }
    catch (error) {
        console.error('Error changing interview status:', error);
        res.status(500).json({ message: 'Error changing interview status' });
    }
});
exports.setInterviewStatus = setInterviewStatus;
const getInterviewsByInterviewerId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interviewerId = req.body.interviewerId;
        const interviews = yield interviewModel_1.default.find({ interviewerId: interviewerId }).populate('interviewerId')
            .populate('intervieweeId').populate('jobId');
        res.status(200).json({ interviews });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
});
exports.getInterviewsByInterviewerId = getInterviewsByInterviewerId;
const getInterviewsByIntervieweeId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const intervieweeId = req.body.intervieweeId;
        console.log(intervieweeId);
        const interviews = yield interviewModel_1.default.find({ intervieweeId: intervieweeId }).populate('interviewerId')
            .populate('intervieweeId').populate('jobId');
        res.status(200).json({ interviews });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
});
exports.getInterviewsByIntervieweeId = getInterviewsByIntervieweeId;
const getInterviewsByJobId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobId = req.body.jobId;
        const interviews = yield interviewModel_1.default.find({ jobId }).populate('interviewerId')
            .populate('intervieweeId').populate('jobId');
        res.status(200).json({ interviews });
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ message: 'Error fetching interviews' });
    }
});
exports.getInterviewsByJobId = getInterviewsByJobId;
