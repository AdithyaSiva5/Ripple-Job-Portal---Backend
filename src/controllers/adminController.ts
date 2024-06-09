import express, { Request, Response } from "express";
import Post from "../models/post/postModel";
const router =express.Router()

import asyncHandler from "express-async-handler";
import Admin from "../models/admin/adminModel";
import generateToken from "../utils/generateToken";
import bcrypt from "bcryptjs";
import User from "../models/user/userModel";
import JobCategory from "../models/jobCategory/jobCategoryModel";



// @desc    Admin Login
// @route   ADMIN /Admin/login
// @access  Public

export const Login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    console.log(admin);
    
    
    if (admin && password=== admin.password) {
        res.status(200).json({
          message: "Login Successful",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: generateToken(admin.id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
});



// @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({});

  if (users) {
    res.status(200).json({ users });
  } else {
    res.status(404);
    throw new Error("Users Not Found");
  }
});



  // @desc    Get all posts
// @route   ADMIN /admin/get-posts
// @access  Public

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find({ isBlocked: false ,isDeleted:false  }).populate({
    path: 'userId',
    select: ' username profileImageUrl email'
  });
 
  


  if (posts) {
    res.status(200).json({ posts });
  } else {
    res.status(404);
    throw new Error(" No Post Found");
  }
});

// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public

  export const userBlock = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.body.userId; 
    console.log(req.body)
    const user = await User.findById(userId)
  
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }
  
    user.isBlocked = !user.isBlocked;
    await user.save();
  
    const users = await User.find({});
    const blocked = user.isBlocked?"Blocked":"Unblocked"
    res.status(200).json({ users,message: `You have ${blocked} ${user.username}`});
  });


  // @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public

export const postBlock = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.body.postId; 
 
  const post = await Post.findById(postId)

  if (!post) {
    res.status(400);
    throw new Error('Post not found');
  }

  post.isBlocked = !post.isBlocked;
  await post.save();

  const posts = await Post.find({});
  const blocked = post.isBlocked?"Blocked":"Unblocked"

  res.status(200).json({ posts,message:`post has been ${blocked}`});
});



      // @desc    Add job category
// @route   ADMIN /admin/get-users
// @access  Public

export const addJobCategory = asyncHandler(async (req: Request, res: Response) => {
   console.log("Reached here");
   
  const { jobCategory} = req.body;
  console.log(jobCategory);
  
  const existingJobCategory= await JobCategory.find({jobCategory});
  if (existingJobCategory.length > 0) {
    res.status(404);
    throw new Error("Job category Already Exist");
  } else {
    await JobCategory.create({jobCategory});

    const allJobCategory = await JobCategory.find({}).sort({date:-1});
    res.status(200).json({ message: "Job cateory added", jobCategory: allJobCategory });
  }
});





    // @desc    Get all job Categoory
// @route   ADMIN /admin/get-users
// @access  Public

export const getJobCategory = asyncHandler(async (req: Request, res: Response) => {
  const jobCategory = await JobCategory.find({}).sort({date:-1});;

  if (jobCategory) {
    res.status(200).json({jobCategory});
  } else {
    res.status(404);
    throw new Error(" No Job category Found");
  }
});



// @desc     block job Category 
// @route   ADMIN /admin/block-job-category
// @access  Public

export const blockJobCategory = asyncHandler(async (req: Request, res: Response) => {
  const jobCategoryId = req.body.jobCategoryId; 
  console.log(req.body)
  const jobCategory = await JobCategory.findById(jobCategoryId)

  if (!jobCategory) {
    res.status(400);
    throw new Error('Category not found');
  }

  jobCategory.isBlocked = !jobCategory.isBlocked;
  await jobCategory.save();

  const allJobCategory = await JobCategory.find({}).sort({date:-1});
  const blocked = jobCategory.isBlocked?"Blocked":"Unblocked"
  res.status(200).json({ allJobCategory,message: `You have ${blocked} ${jobCategory.jobCategory}`});
});