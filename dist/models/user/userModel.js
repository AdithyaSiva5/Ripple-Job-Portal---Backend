"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userTypes_1 = require("./userTypes");
const UserSchema = new mongoose_1.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isHiring: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isGoogle: { type: Boolean, default: false },
    isFacebook: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    dailyJobsApplied: { type: Number, default: 0 },
    premiumExpiryDate: { type: Date, required: false },
    userType: { type: String, enum: Object.values(userTypes_1.UserType) },
    profile: {
        fullname: { type: String },
        about: { type: String },
        location: { type: String },
        qualification: [
            { course: String, institution: String, yearOfCompletion: Number },
        ],
        experience: [
            { jobPosition: String, yearOfJoining: Number, companyName: String },
        ],
        skills: [{ type: String }],
        resume: { type: String },
        gender: { type: String },
        dateOfBirth: { type: Date },
        designation: { type: String },
    },
    companyProfile: {
        companyName: { type: String },
        companyLocation: { type: String },
        aboutCompany: { type: String },
        noOfEmployees: { type: Number },
        establishedOn: { type: Date },
        companyType: { type: String },
    },
    phone: { type: String },
    savedPosts: [{ type: mongoose_1.default.Types.ObjectId, ref: "Post" }],
    savedJobs: [{ type: mongoose_1.default.Types.ObjectId, ref: "Job" }],
    isActive: { type: Boolean, default: true },
    profileImageUrl: {
        type: String,
        default: "https://i.postimg.cc/8z7vvppS/default-user-profile.png",
    },
    refreshToken: {
        type: String,
        default: null,
    },
}, { timestamps: true });
const User = mongoose_1.default.model("User", UserSchema);
exports.default = User;
