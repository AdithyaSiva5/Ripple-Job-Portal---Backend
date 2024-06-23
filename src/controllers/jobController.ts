import Job from "../models/jobs/jobModel";
import { IJob } from "../models/jobs/jobTypes";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";







//add Job

export const addJob =  asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("readeched add jobs");
    console.log(req.body);
    
    
    const {
      userId,
      companyName,
      jobRole,
      experience,
      salary,
      jobType,
      jobLocation,
      lastDateToApply,
      requiredSkills,
      jobDescription,
      qualification,
    } = req.body;

    const newJob = new Job({
      userId,
      companyName,
      jobRole,
      experience,
      salary,
      jobType,
      jobLocation,
      lastDateToApply,
      requiredSkills,
      jobDescription,
      qualification,
      isDeleted: false, 
    });

  
    await newJob.save();

    res.status(201).json({ message: 'Job added successfully', job: newJob });
  } catch (error) {
    console.error('Error adding job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
)


//list job

export const listActiveJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("reached");
    

    const jobs: IJob[] = await Job.find({ isDeleted: { $ne: true } }).populate({
      path: 'userId',
      select: 'username profileImageUrl',
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error listing active jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};