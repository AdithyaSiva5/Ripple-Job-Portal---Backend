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
  userSuggestions,
  getUserDetails,
  updateUserRole
} from "../controllers/userController";
import { protect } from "../middlewares/auth";
const router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/register-otp", verifyOTP);
router.post("/resend-otp", resendOtp);
router.post("/google-auth", googleAuth);
router.post("/forgot-password", forgotPassword);
router.post("/forgot-otp", forgotOtp);
router.post("/reset-password", resetPassword);
router.post("/set-preferences", updateUserTypeAndHiring);
router.post("/set-user-role", updateUserRole);
router.post("/set-basic-information",updateBasicInformation);
router.post('/user-suggestions',userSuggestions);
router.get('/user-details/:userId',getUserDetails);

export default router;
