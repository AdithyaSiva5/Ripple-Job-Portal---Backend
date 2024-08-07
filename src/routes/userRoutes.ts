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
  getSettings,
  refreshToken,
  logout,
  updateUserResume,
} from "../controllers/userController";
import { protect } from "../middlewares/auth";
import {
  getPremiumUserData,
  initiatecheckout,
  validatePayment,
} from "../controllers/checkoutController";
import {
  clearnotification,
  getNotifications,
} from "../controllers/notificationController";
import { searchAllCollections } from "../controllers/searchController";
import { updateSettings } from "../controllers/settingsvalidation";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});


const upload = multer({ storage: storage });
const router = express.Router();
upload.any();

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
router.post("/set-preferences", protect, updateUserTypeAndHiring);
router.post("/set-user-role", protect, updateUserRole);
router.post("/set-basic-information", updateBasicInformation);
router.get("/user-details/:userId", protect, getUserDetails);
router.post("/user-suggestions", protect, userSuggestions);
router.post("/checkout-user", protect, initiatecheckout);
router.post("/validate-payment", protect, validatePayment);
router.post("/get-transactions", protect, getPremiumUserData);
router.post("/get-notifications", protect, getNotifications);
router.delete("/clear-notifications", protect, clearnotification);
router.get("/search", protect, searchAllCollections);
router.get("/get-settings", protect, getSettings);
router.post("/update-settings", protect, updateSettings);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post(
  "/update-resume",
  protect,
  upload.single("resume"),
  updateUserResume
);

export default router;
