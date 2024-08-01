"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const interviewSchema = new mongoose_1.Schema({
    interviewerId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    intervieweeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    applicationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Application',
        required: true,
    },
    jobId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
    },
    jury: {
        type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
    interviewDate: {
        type: Date,
        required: true,
    },
    interviewTime: {
        type: String,
        required: true,
    },
    interviewLink: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
}, { timestamps: true });
const Interview = (0, mongoose_1.model)('Interview', interviewSchema);
exports.default = Interview;
