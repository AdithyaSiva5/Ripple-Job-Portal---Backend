"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const checkoutController_1 = require("../controllers/checkoutController");
const notificationController_1 = require("../controllers/notificationController");
const searchController_1 = require("../controllers/searchController");
const settingsvalidation_1 = require("../controllers/settingsvalidation");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "src/public/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
router.use((err, req, res, next) => {
    console.log(req);
    if (err instanceof multer_1.default.MulterError) {
        console.error("Multer error:", err);
        res.status(400).json({ error: "File upload failed", message: err.message });
    }
    else {
        console.error("Other error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});
router.get("/", (req, res) => {
    res.send("Ripple Job Portal");
});
router.post("/register", userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.post("/register-otp", userController_1.verifyOTP);
router.post("/resend-otp", userController_1.resendOtp);
router.post("/google-auth", userController_1.googleAuth);
router.post("/forgot-password", userController_1.forgotPassword);
router.post("/forgot-otp", userController_1.forgotOtp);
router.post("/reset-password", userController_1.resetPassword);
router.post("/set-preferences", auth_1.protect, userController_1.updateUserTypeAndHiring);
router.post("/set-user-role", auth_1.protect, userController_1.updateUserRole);
router.post("/set-basic-information", userController_1.updateBasicInformation);
router.get("/user-details/:userId", auth_1.protect, userController_1.getUserDetails);
router.post("/user-suggestions", auth_1.protect, userController_1.userSuggestions);
router.post("/checkout-user", auth_1.protect, checkoutController_1.initiatecheckout);
router.post("/validate-payment", auth_1.protect, checkoutController_1.validatePayment);
router.post("/get-transactions", auth_1.protect, checkoutController_1.getPremiumUserData);
router.post("/get-notifications", auth_1.protect, notificationController_1.getNotifications);
router.delete("/clear-notifications", auth_1.protect, notificationController_1.clearnotification);
router.get("/search", auth_1.protect, searchController_1.searchAllCollections);
router.get("/get-settings", auth_1.protect, userController_1.getSettings);
router.post("/update-settings", auth_1.protect, settingsvalidation_1.updateSettings);
router.post("/refresh-token", userController_1.refreshToken);
router.post("/logout", userController_1.logout);
router.post("/update-resume", upload.single("resume"), userController_1.updateUserResume);
exports.default = router;
