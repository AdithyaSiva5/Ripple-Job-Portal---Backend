import express, { Express, Request, Response } from "express";
import {
  registerUser,
  verifyOTP,
  loginUser,
  resendOtp,
  googleAuth,
  forgotOtp,
  forgotPassword,
  resetPassword,
  updateUserTypeAndHiring,
  updateBasicInformation,
  getUserDetails,
  updateUserRole,
  userSuggestions
} from "../controllers/userController";
import { protect } from "../middlewares/auth";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Ripple Job Portal");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register-otp", verifyOTP);
router.post("/resend-otp", resendOtp);
router.post("/google-auth", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-otp", forgotOtp);
router.post("/reset-password", resetPassword);
router.post("/set-preferences",protect, updateUserTypeAndHiring);
router.post("/set-user-role",protect, updateUserRole);
router.post("/set-basic-information",updateBasicInformation);
router.get('/user-details/:userId',protect,getUserDetails);
router.post('/user-suggestions',protect,userSuggestions);

export default router;
