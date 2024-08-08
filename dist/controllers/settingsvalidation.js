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
exports.updateSettings = void 0;
const userModel_1 = __importDefault(require("../models/user/userModel"));
const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear;
};
const validateExperience = (experience) => {
    return experience.every((exp) => exp.jobPosition &&
        exp.jobPosition.trim() !== "" &&
        exp.companyName &&
        exp.companyName.trim() !== "" &&
        exp.yearOfJoining &&
        validateYear(exp.yearOfJoining));
};
const validateQualification = (qualification) => {
    return qualification.every((qual) => qual.course &&
        qual.course.trim() !== "" &&
        qual.institution &&
        qual.institution.trim() !== "" &&
        qual.yearOfCompletion &&
        validateYear(qual.yearOfCompletion));
};
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const updates = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }
        if (updates.profile) {
            if (updates.profile.experience) {
                if (!validateExperience(updates.profile.experience)) {
                    return res
                        .status(400)
                        .json({
                        message: "Invalid experience data. Please ensure all fields are filled and the year is valid.",
                    });
                }
                user.profile.experience = updates.profile.experience;
            }
            if (updates.profile.skills) {
                user.profile.skills = updates.profile.skills;
            }
            if (updates.profile.qualification) {
                if (!validateQualification(updates.profile.qualification)) {
                    return res
                        .status(400)
                        .json({
                        message: "Invalid qualification data. Please ensure all fields are filled and the year is valid.",
                    });
                }
                user.profile.qualification = updates.profile.qualification;
            }
            if (updates.profile.gender) {
                user.profile.gender = updates.profile.gender;
            }
        }
        yield user.save();
        res.json(user);
    }
    catch (error) {
        console.error("Error in updateSettings:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateSettings = updateSettings;
