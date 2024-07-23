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
  userSuggestions,
  updateSettings,
  getSettings,
} from "../controllers/userController";
import { protect } from "../middlewares/auth";
import { getPremiumUserData, initiatecheckout, validatePayment } from "../controllers/checkoutController";
import { getNotifications } from "../controllers/notificationController";
import { searchAllCollections } from "../controllers/searchController";
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
router.post("/checkout-user",protect, initiatecheckout);
router.post("/validate-payment",protect,validatePayment);
router.post("/get-transactions",protect,getPremiumUserData);
router.post("/get-notifications",protect,getNotifications )
router.get("/search",protect,searchAllCollections)
router.get('/get-settings',protect, getSettings); 
router.post('/update-settings',protect, updateSettings);



export default router;
