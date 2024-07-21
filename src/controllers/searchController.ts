import { Request, Response } from 'express';
import User from "../models/user/userModel";
import Post from "../models/post/postModel";
import Job from "../models/jobs/jobModel";
import asyncHandler from "express-async-handler"; 


export const searchAllCollections =asyncHandler( async (req: Request, res: Response): Promise<void> => {
  try {
    const searchQuery: string = req.query.searchQuery as string;
    

    console.log(searchQuery);
    

  
    const users = await User.find({
      $or: [
        { username: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
      ],
    })


    const posts = await Post.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } }, 
      ],
    }).populate(
        "userId"
      );;

   
    const jobs = await Job.find({
      $or: [
        { companyName: { $regex: searchQuery, $options: 'i' } },
        { jobRole: { $regex: searchQuery, $options: 'i' } },
        { jobLocation: { $regex: searchQuery, $options: 'i' } }, 
        { requiredSkills: { $regex: searchQuery, $options: 'i' } }, 
        { jobDescription: { $regex: searchQuery, $options: 'i' } },
        { qualification: { $regex: searchQuery, $options: 'i' } }, 
      ],
    })


    res.status(200).json({ users, posts, jobs });
  } catch (error) {
    console.error('Error searching collections:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})