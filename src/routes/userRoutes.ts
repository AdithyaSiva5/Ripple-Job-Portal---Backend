import express, { Express, Request, Response } from "express";
import { registerUser,verifyOTP ,loginUser ,resendOtp, googleAuth,forgotOtp,forgotPassword,resetPassword} from '../controllers/userController';
import { protect } from '../middlewares/auth';
const router = express.Router()

router.get('/',(req:Request,res:Response)=>{
    res.send("Express + TypeScript Server");
})

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/register-otp',verifyOTP)
router.post('/resend-otp',resendOtp)
router.post('/google-auth',googleAuth)
router.post('/forgot-password',forgotPassword)
router.post('/forgot-otp',forgotOtp)
router.post('/reset-password',resetPassword)


export default router 