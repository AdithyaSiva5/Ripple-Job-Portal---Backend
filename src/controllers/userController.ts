import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import sendVerifyMail from "../utils/sendVerifyMail";
import speakeasy from "speakeasy";
import { IUser, UserType } from "../models/user/userTypes";
import Connections from "../models/connections/connectionModel";
import jwt from "jsonwebtoken";
import { RequestWithToken } from "../middlewares/RequestWithToken";
import JobCategory from "../models/jobCategory/jobCategoryModel";
import generateRefreshToken from "../utils/generateRefreshToken";

// @desc    Register new User
// @route   USER /register
// @access  Public

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      throw new Error("Please add fields");
    }
    console.log(username, email, password);

    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(400);
      throw new Error("User already exists");
    }

    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
    console.log("user Otp = " + otp);

    const sessionData = req.session!;
    sessionData.userDetails = { username, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    sessionData.userDetails!.password = hashedPassword;
    sendVerifyMail(req, username, email);

    res.status(200).json({ message: "OTP sent for verification", email, otp });
  }
);

// @desc    Register OTP Verification
// @route   USER /register-otp
// @access  Public

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  console.log(req.body);
  console.log(otp);

  if (!otp) {
    res.status(400);
    throw new Error("Please provide OTP");
  }

  const sessionData = req.session!;
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
  const user = await User.create({
    username: userDetails.username,
    email: userDetails.email,
    password: userDetails.password,
  });

  delete sessionData.userDetails;
  delete sessionData.otp;

  res
    .status(200)
    .json({ message: "OTP verified succesfully, user created", user });
});

// @desc    Resent OTP
// @route   USER /resend-otp
// @access  Public

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    digits: 4,
  });

  const sessionData = req.session!;
  sessionData.otp = otp;
  sessionData.otpGeneratedTime = Date.now();

  const userDetails = sessionData.userDetails;
  if (!userDetails) {
    res.status(400).json({ message: "User details not found in session" });
    return;
  }
  console.log("user Otp = " + otp);
  sendVerifyMail(req, userDetails.username, userDetails.email);
  res.status(200).json({ message: "OTP sent for verification", email, otp });
});

// @desc    User Login
// @route   USER /login
// @access  Public

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    if (user.isBlocked) {
      res.status(400);
      throw new Error("User is blocked");
    }
    const accessToken = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    user.refreshToken = refreshToken;
    await user.save();

    const userData = await User.findOne(
      { email },
      { password: 0, refreshToken: 0 }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 24 * 60 * 60 * 1000, // 60 days
    });

    res.json({
      message: "Login Successful",
      user: userData,
      accessToken,
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

// @desc    Google Authentication
// @route   USER /google-auth
// @access  Public

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, imageUrl } = req.body;

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      if (userExist.isBlocked) {
        res.status(400).json({ message: "User is blocked" });
        return;
      }

      const accessToken = generateToken(userExist.id);
      const refreshToken = generateRefreshToken(userExist.id);

      userExist.refreshToken = refreshToken;
      await userExist.save();

      const userData = await User.findOne(
        { email },
        { password: 0, refreshToken: 0 }
      );

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      profileImageUrl: imageUrl,
      isGoogle: true,
    });

    const accessToken = generateToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    const userData = await User.findOne(
      { email },
      { password: 0, refreshToken: 0 }
    );
    res.status(200).json({
      message: "Login Successful",
      user: userData,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Forgot Password
// @route   USER /forgot-password
// @access  Public

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4,
      });

      const sessionData = req.session!;
      sessionData.otp = otp;
      sessionData.otpGeneratedTime = Date.now();
      sessionData.email = email;
      sendVerifyMail(req, user.username, user.email);
      console.log(otp);
      res
        .status(200)
        .json({ message: `OTP has been send to your email`, email });
    } else {
      res.status(400);
      throw new Error("Not User Found");
    }
  }
);

// @desc    Forgot Password OTP verification
// @route   USER /forgot-otp
// @access  Public
export const forgotOtp = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    res.status(400);
    throw new Error("Please provide OTP");
  }
  const sessionData = req.session!;

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
    email: sessionData?.email,
  });
});

// @desc    Reset-Password
// @route   USER /reset-passwordt
// @access  Public
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
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

    const user = await User.findOne({ email: sessionData.email });
    if (!user) {
      res.status(400);
      throw new Error("User Not Found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully" });
  }
);

export const updateUserTypeAndHiring = async (req: Request, res: Response) => {
  try {
    const { userId, userType, isHiring } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userType = userType as UserType;
    if (isHiring === "isHiring") {
      user.isHiring = true;
    } else {
      user.isHiring = false;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserInformation = async (req: Request, res: Response) => {
  try {
    const { userId, userType, isHiring } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userType = userType as UserType;
    if (isHiring === "isHiring") {
      user.isHiring = true;
    } else {
      user.isHiring = false;
    }

    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, userType, isHiring } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.userType = userType as UserType;
    user.isHiring = isHiring;
    await user.save();
    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBasicInformation = async (req: Request, res: Response) => {
  try {
    const { userId, imageUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.userType === "individual") {
      const {
        fullname,
        location,
        designation,
        dateOfBirth,
        phone,
        gender,
        about,
      } = req.body;

      user.profile.fullname = fullname;
      user.profile.location = location;
      user.profile.designation = designation;
      user.profile.dateOfBirth = dateOfBirth;
      user.phone = phone;
      user.profile.gender = gender;
      user.profile.about = about;
    } else if (user.userType === "organization") {
      const {
        fullname,
        location,
        phone,
        about,
        noOfEmployees,
        establishedOn,
        companyType,
      } = req.body;
      console.log(companyType);

      user.companyProfile.companyName = fullname;
      user.companyProfile.companyLocation = location;
      user.companyProfile.aboutCompany = about;
      user.companyProfile.establishedOn = establishedOn;
      user.companyProfile.noOfEmployees = noOfEmployees;
      user.companyProfile.companyType = companyType;
      user.phone = phone;
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    if (imageUrl) {
      user.profileImageUrl = imageUrl;
    }

    await user.save();
    const userData = await User.findOne({ _id: userId }, { password: 0 });

    res.status(200).json({
      message: "Basic information updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Error updating basic information:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const connection = await Connections.findOne({ userId });
    if (!connection) {
      const users = await User.find({ _id: { $ne: userId } });
      res.status(200).json({ suggestedUsers: users });
      return;
    }
    const followingIds = connection.connections.map((user: any) => user._id);
    const requestedIds = connection.requestSent.map((user: any) => user._id);

    const suggestedUsers = await User.find(
      {
        _id: { $nin: [...followingIds, ...requestedIds, userId] },
      },
      { password: 0 }
    );

    res.status(200).json({ suggestedUsers });
  }
);

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404);
      throw new Error(" user Not found");
    }
  }
);

export const getSettings = async (req: RequestWithToken, res: Response) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const jobCategories = await JobCategory.find({ isBlocked: false });
    const responseData = {
      user,
      jobCategories: jobCategories.map((category) => ({
        id: category._id,
        name: category.jobCategory,
      })),
    };
    res.json(responseData);
  } catch (error) {
    console.error("Error in getSettings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("Received refresh token:", refreshToken);
    if (!refreshToken) {
      res.status(400);
      throw new Error("Refresh token is required");
    }

    try {
      const decoded: any = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as string
      );
      const user = await User.findOne({ _id: decoded.id });
      if (!user) {
        res.status(401);
        throw new Error("Invalid refresh token");
      }

      const newAccessToken = generateToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);

      user.refreshToken = newRefreshToken;
      await user.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 24 * 60 * 60 * 1000,
      });
      res.json({ accessToken: newAccessToken });
    } catch (error) {
      res.status(401);
      throw new Error("Invalid refresh token");
    }
  }
);

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(400);
    throw new Error("Refresh token is required");
  }

  try {
    const user = await User.findOneAndUpdate(
      { refreshToken: refreshToken },
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    if (!user) {
      res.status(400);
      throw new Error("User not found or already logged out");
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout process:", error);
    res.status(500);
    throw new Error("An error occurred during logout");
  }
});

export const updateUserResume = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const resumeFilename = req.file?.filename;
    if (!resumeFilename) {
      return res.status(400).json({ message: "No resume file uploaded" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { "profile.resume": resumeFilename },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Resume updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};