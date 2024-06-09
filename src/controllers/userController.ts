import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken";
import sendVerifyMail from "../utils/sendVerifyMail";
import speakeasy from "speakeasy";


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

    const sessionData = req.session!;
    sessionData.userDetails = { username, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    sessionData.userDetails!.password = hashedPassword;
    sendVerifyMail(req, username, email);

    res.status(200).json({ message: "OTP sent for verification", email,otp});
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

  res.status(200).json({ message: "OTP verified succesfully, user created", user });
});



// @desc    Resent OTP 
// @route   USER /resend-otp
// @access  Public


export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const {email} = req.body;
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
  console.log(otp)
  sendVerifyMail(req, userDetails.username, userDetails.email);
  res.status(200).json({ message: "OTP sent for verification" ,email,otp});
});


// @desc    User Login
// @route   USER /login
// @access  Public

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(req.body);
  
  const user = await User.findOne({ email });
  console.log(user);
  
  
  if (user) {
    if (user.isBlocked) {
      res.status(400);
      throw new Error("User is blocked");
    }
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({ message: "Login Sucessful" ,
      _id: user.id,
      name: user.username,
      email: user.email,
      profileImg: user.profileImageUrl,
      token: generateToken(user.id),
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

      if (userExist) {
        res.json({
          message: "Login Successful",
          _id: userExist.id,
          name: userExist.username,
          email: userExist.email,
          profileImg: userExist.profileImageUrl,
          token: generateToken(userExist.id),
        });
        return;
      }
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

    const token = generateToken(newUser.id);

    res.status(200).json({
      message: "Login Successful",
      _id: newUser.id,
      name: newUser.username,
      email: newUser.email,
      profileImg: newUser.profileImageUrl,
      token: token,
    });
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @desc    Forgot Password
// @route   USER /forgot-password
// @access  Public

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4, 
    });

    const sessionData = req.session!;
    sessionData.otp = otp;    
    sessionData.otpGeneratedTime = Date.now()
    sessionData.email = email;
    sendVerifyMail(req, user.username, user.email);
    console.log(otp)
    res.status(200).json({message:`OTP has been send to your email`,email})
  }
   else {
    res.status(400);
    throw new Error("Not User Found");
  }
});




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
  console.log(storedOTP)
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
  delete sessionData.otpGeneratedTime

  res.status(200).json({ message: "OTP has been verified. Please reset password" ,email:sessionData?.email});
});


// @desc    Reset-Password
// @route   USER /reset-passwordt
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password, confirmPassword } = req.body;
  const sessionData = req.session;

  if (!sessionData || !sessionData.email) {
    res.status(400);
    throw new Error('No session data found');
  }

  if (password !== confirmPassword) {
    res.status(400);
    throw new Error('Password do not match');
  }

  const user = await User.findOne({ email: sessionData.email });
  if (!user) {
    res.status(400);
    throw new Error('User Not Found');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  user.password = hashedPassword;
  await user.save();
  res.status(200).json({ message: 'Password has been reset successfully' });
});