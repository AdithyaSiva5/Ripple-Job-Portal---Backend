import express , { Express, Request, Response} from "express"
import { registerUser,verifyOTP ,loginUser ,resendOtp, googleAuth,forgotOtp,forgotPassword,resetPassword} from '../controllers/userController';
const router = express.Router()

router.get('/',(req: Request , res : Response)=>{
    res.send("Welcome to Ripple Job Portal")
})

router.post('/register' , registerUser);
router.post('/login' , loginUser);
router.post('/register-otp' , verifyOTP);
router.post('/resend-otp' , resendOtp);
router.post('/google-auth' , googleAuth);
router.post('/forgot-password' , forgotPassword);
router.post('/forgot-otp' , forgotOtp);
router.post('/reset-password' , resetPassword);

export default router
