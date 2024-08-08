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
exports.updateUserResume = exports.logout = exports.refreshToken = exports.getSettings = exports.getUserDetails = exports.userSuggestions = exports.updateBasicInformation = exports.updateUserRole = exports.updateUserInformation = exports.updateUserTypeAndHiring = exports.resetPassword = exports.forgotOtp = exports.forgotPassword = exports.googleAuth = exports.loginUser = exports.resendOtp = exports.verifyOTP = exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const sendVerifyMail_1 = __importDefault(require("../utils/sendVerifyMail"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jobCategoryModel_1 = __importDefault(require("../models/jobCategory/jobCategoryModel"));
const generateRefreshToken_1 = __importDefault(require("../utils/generateRefreshToken"));
// @desc    Register new User
// @route   USER /register
// @access  Public
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new Error("Please add fields");
    }
    console.log(username, email, password);
    const userExist = yield userModel_1.default.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    console.log("user Otp = " + otp);
    const sessionData = req.session;
    sessionData.userDetails = { username, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    sessionData.userDetails.password = hashedPassword;
    (0, sendVerifyMail_1.default)(req, username, email);
    res.status(200).json({ message: "OTP sent for verification", email, otp });
}));
// @desc    Register OTP Verification
// @route   USER /register-otp
// @access  Public
exports.verifyOTP = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    console.log(req.body);
    console.log(otp);
    if (!otp) {
        res.status(400);
        throw new Error("Please provide OTP");
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log(storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400);
        throw new Error("OTP has expired");
    }
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400);
        throw new Error("User details not found in session");
    }
    const user = yield userModel_1.default.create({
        username: userDetails.username,
        email: userDetails.email,
        password: userDetails.password,
    });
    delete sessionData.userDetails;
    delete sessionData.otp;
    res
        .status(200)
        .json({ message: "OTP verified succesfully, user created", user });
}));
// @desc    Resent OTP
// @route   USER /resend-otp
// @access  Public
exports.resendOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    const sessionData = req.session;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400).json({ message: "User details not found in session" });
        return;
    }
    console.log("user Otp = " + otp);
    (0, sendVerifyMail_1.default)(req, userDetails.username, userDetails.email);
    res.status(200).json({ message: "OTP sent for verification", email, otp });
}));
// @desc    User Login
// @route   USER /login
// @access  Public
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
        if (user.isBlocked) {
            res.status(400);
            throw new Error("User is blocked");
        }
        const accessToken = (0, generateToken_1.default)(user.id);
        const refreshToken = (0, generateRefreshToken_1.default)(user.id);
        user.refreshToken = refreshToken;
        yield user.save();
        const userData = yield userModel_1.default.findOne({ email }, { password: 0, refreshToken: 0 });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
        });
        res.json({
            message: "Login Successful",
            user: userData,
            accessToken,
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
}));
// @desc    Google Authentication
// @route   USER /google-auth
// @access  Public
exports.googleAuth = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, imageUrl } = req.body;
    try {
        const userExist = yield userModel_1.default.findOne({ email });
        if (userExist) {
            if (userExist.isBlocked) {
                res.status(400).json({ message: "User is blocked" });
                return;
            }
            const accessToken = (0, generateToken_1.default)(userExist.id);
            const refreshToken = (0, generateRefreshToken_1.default)(userExist.id);
            userExist.refreshToken = refreshToken;
            yield userExist.save();
            const userData = yield userModel_1.default.findOne({ email }, { password: 0, refreshToken: 0 });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 24 * 60 * 60 * 1000,
            });
            res.json({
                message: "Login Successful",
                user: userData,
                accessToken,
            });
            return;
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10);
        const newUser = yield userModel_1.default.create({
            username,
            email,
            password: hashedPassword,
            profileImageUrl: imageUrl,
            isGoogle: true,
        });
        const accessToken = (0, generateToken_1.default)(newUser.id);
        const refreshToken = (0, generateRefreshToken_1.default)(newUser.id);
        newUser.refreshToken = refreshToken;
        yield newUser.save();
        const userData = yield userModel_1.default.findOne({ email }, { password: 0, refreshToken: 0 });
        res.status(200).json({
            message: "Login Successful",
            user: userData,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        console.error("Error in Google authentication:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @desc    Forgot Password
// @route   USER /forgot-password
// @access  Public
exports.forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user) {
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
            digits: 4,
        });
        const sessionData = req.session;
        sessionData.otp = otp;
        sessionData.otpGeneratedTime = Date.now();
        sessionData.email = email;
        (0, sendVerifyMail_1.default)(req, user.username, user.email);
        console.log(otp);
        res
            .status(200)
            .json({ message: `OTP has been send to your email`, email });
    }
    else {
        res.status(400);
        throw new Error("Not User Found");
    }
}));
// @desc    Forgot Password OTP verification
// @route   USER /forgot-otp
// @access  Public
exports.forgotOtp = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        res.status(400);
        throw new Error("Please provide OTP");
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log(storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400);
        throw new Error("OTP has expired");
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res.status(200).json({
        message: "OTP has been verified. Please reset password",
        email: sessionData === null || sessionData === void 0 ? void 0 : sessionData.email,
    });
}));
// @desc    Reset-Password
// @route   USER /reset-passwordt
// @access  Public
exports.resetPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;
    if (!sessionData || !sessionData.email) {
        res.status(400);
        throw new Error("No session data found");
    }
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error("Password do not match");
    }
    const user = yield userModel_1.default.findOne({ email: sessionData.email });
    if (!user) {
        res.status(400);
        throw new Error("User Not Found");
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    user.password = hashedPassword;
    yield user.save();
    res.status(200).json({ message: "Password has been reset successfully" });
}));
const updateUserTypeAndHiring = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType, isHiring } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.userType = userType;
        if (isHiring === "isHiring") {
            user.isHiring = true;
        }
        else {
            user.isHiring = false;
        }
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUserTypeAndHiring = updateUserTypeAndHiring;
const updateUserInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType, isHiring } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.userType = userType;
        if (isHiring === "isHiring") {
            user.isHiring = true;
        }
        else {
            user.isHiring = false;
        }
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUserInformation = updateUserInformation;
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, userType, isHiring } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.userType = userType;
        user.isHiring = isHiring;
        yield user.save();
        res.status(200).json({ message: "User updated successfully", user });
    }
    catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUserRole = updateUserRole;
const updateBasicInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, imageUrl } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.userType === "individual") {
            const { fullname, location, designation, dateOfBirth, phone, gender, about, } = req.body;
            user.profile.fullname = fullname;
            user.profile.location = location;
            user.profile.designation = designation;
            user.profile.dateOfBirth = dateOfBirth;
            user.phone = phone;
            user.profile.gender = gender;
            user.profile.about = about;
        }
        else if (user.userType === "organization") {
            const { fullname, location, phone, about, noOfEmployees, establishedOn, companyType, } = req.body;
            console.log(companyType);
            user.companyProfile.companyName = fullname;
            user.companyProfile.companyLocation = location;
            user.companyProfile.aboutCompany = about;
            user.companyProfile.establishedOn = establishedOn;
            user.companyProfile.noOfEmployees = noOfEmployees;
            user.companyProfile.companyType = companyType;
            user.phone = phone;
        }
        else {
            return res.status(400).json({ message: "Invalid user type" });
        }
        if (imageUrl) {
            user.profileImageUrl = imageUrl;
        }
        yield user.save();
        const userData = yield userModel_1.default.findOne({ _id: userId }, { password: 0 });
        res.status(200).json({
            message: "Basic information updated successfully",
            user: userData,
        });
    }
    catch (error) {
        console.error("Error updating basic information:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateBasicInformation = updateBasicInformation;
exports.userSuggestions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    const connection = yield connectionModel_1.default.findOne({ userId });
    if (!connection) {
        const users = yield userModel_1.default.find({ _id: { $ne: userId } });
        res.status(200).json({ suggestedUsers: users });
        return;
    }
    const followingIds = connection.connections.map((user) => user._id);
    const requestedIds = connection.requestSent.map((user) => user._id);
    const suggestedUsers = yield userModel_1.default.find({
        _id: { $nin: [...followingIds, ...requestedIds, userId] },
    }, { password: 0 });
    res.status(200).json({ suggestedUsers });
}));
exports.getUserDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield userModel_1.default.findById(userId);
    if (user) {
        res.status(200).json({ user });
    }
    else {
        res.status(404);
        throw new Error(" user Not found");
    }
}));
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const jobCategories = yield jobCategoryModel_1.default.find({ isBlocked: false });
        const responseData = {
            user,
            jobCategories: jobCategories.map((category) => ({
                id: category._id,
                name: category.jobCategory,
            })),
        };
        res.json(responseData);
    }
    catch (error) {
        console.error("Error in getSettings:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getSettings = getSettings;
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    console.log("Received refresh token:", refreshToken);
    if (!refreshToken) {
        res.status(400);
        throw new Error("Refresh token is required");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
        const user = yield userModel_1.default.findOne({ _id: decoded.id });
        if (!user) {
            res.status(401);
            throw new Error("Invalid refresh token");
        }
        const newAccessToken = (0, generateToken_1.default)(user._id);
        const newRefreshToken = (0, generateRefreshToken_1.default)(user._id);
        user.refreshToken = newRefreshToken;
        yield user.save();
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 24 * 60 * 60 * 1000,
        });
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        res.status(401);
        throw new Error("Invalid refresh token");
    }
}));
exports.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(400);
        throw new Error("Refresh token is required");
    }
    try {
        const user = yield userModel_1.default.findOneAndUpdate({ refreshToken: refreshToken }, { $unset: { refreshToken: 1 } }, { new: true });
        if (!user) {
            res.status(400);
            throw new Error("User not found or already logged out");
        }
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.error("Error during logout process:", error);
        res.status(500);
        throw new Error("An error occurred during logout");
    }
}));
const updateUserResume = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.body.userId;
        const resumeFilename = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
        if (!resumeFilename) {
            return res.status(400).json({ message: 'No resume file uploaded' });
        }
        const updatedUser = yield userModel_1.default.findByIdAndUpdate(userId, { 'profile.resume': resumeFilename }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Resume updated successfully', user: updatedUser });
    }
    catch (error) {
        console.error('Error updating resume:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateUserResume = updateUserResume;
