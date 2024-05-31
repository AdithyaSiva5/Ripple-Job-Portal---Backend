import express , { Request , Response } from "express";
const router = express.Router()

import asyncHandler from "express-async-handler"
import Admin from "../models/admin/adminModel"
import generateToken from "../utils/generateToken";
import bcrypt from "bcryptjs"
import User from "../models/user/userModel"

//admin login

export const Login = asyncHandler(async (req: Request,res: Response)=>{
    const {email,password } = req.body;
    const admin = await Admin.findOne({ email})
    console.log(admin);

    if(admin && password === admin.password){
        res.status(200).json({
            message : "Login Successful",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: generateToken(admin.id),
        })
    }else{
        res.status(400);
        throw new Error("Invalid Credentials")
    }
})

//Get Users
export const getUsers = asyncHandler(async (req: Request , res : Response)=>{
    const users = await User.find({})
    if(users){
        res.status(200).json({users})

    }else{
        res.status(404);
        throw new Error("Users Not Found")
    }
})

//Block Users
export const userBlock = asyncHandler(async (req: Request, res: Response)=>{
    const userId : string = req.body.userId;
    const user = await User.findById(userId)

    if(!user){
        res.status(400)
        throw new Error('User not found')
    }
    user.isBlocked = !user.isBlocked
    await user.save()

    const users = await User.find({})
    res.status(200).json({ users})
})
export default router