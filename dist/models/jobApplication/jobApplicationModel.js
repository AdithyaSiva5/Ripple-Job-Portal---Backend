"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jobApplicationSchema = new mongoose_1.Schema({
    applicantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicationStatus: {
        type: String,
        required: true,
        default: "Pending"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    coverLetter: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    },
    isInterviewScheduled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
const Post = (0, mongoose_1.model)('Application', jobApplicationSchema);
exports.default = Post;
