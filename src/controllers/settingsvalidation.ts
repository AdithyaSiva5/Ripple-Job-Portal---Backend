import { Response } from "express";
import { RequestWithToken } from "../middlewares/RequestWithToken";
import User from "../models/user/userModel";

const validateYear = (year: number) => {
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear;
};

const validateExperience = (experience: any[]) => {
  return experience.every(
    (exp) =>
      exp.jobPosition &&
      exp.jobPosition.trim() !== "" &&
      exp.companyName &&
      exp.companyName.trim() !== "" &&
      exp.yearOfJoining &&
      validateYear(exp.yearOfJoining)
  );
};

const validateQualification = (qualification: any[]) => {
  return qualification.every(
    (qual) =>
      qual.course &&
      qual.course.trim() !== "" &&
      qual.institution &&
      qual.institution.trim() !== "" &&
      qual.yearOfCompletion &&
      validateYear(qual.yearOfCompletion)
  );
};

export const updateSettings = async (req: RequestWithToken, res: Response) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const user = await User.findById(userId, { password: 0, refreshToken: 0 });
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
              message:
                "Invalid experience data. Please ensure all fields are filled and the year is valid.",
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
              message:
                "Invalid qualification data. Please ensure all fields are filled and the year is valid.",
            });
        }
        user.profile.qualification = updates.profile.qualification;
      }

      if (updates.profile.gender) {
        user.profile.gender = updates.profile.gender;
      }
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error in updateSettings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
