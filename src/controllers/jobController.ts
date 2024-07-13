import Job from "../models/jobs/jobModel";
import { IJob } from "../models/jobs/jobTypes";
import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import User from "../models/user/userModel";
import JobApplication from '../models/jobApplication/jobApplicationModel'; 
import mongoose from "mongoose";


//add Job

export const addJob =  asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {    
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

//editjob
export const editJob = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      jobId,
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
  console.log(req.body);
  
    
    const existingJob = await Job.findById(jobId);

    if (!existingJob) {
      res.status(404).json({ message: 'Job not found' });
      return;
    }

    existingJob.companyName = companyName;
    existingJob.jobRole = jobRole;
    existingJob.experience = experience;
    existingJob.salary = salary;
    existingJob.jobType = jobType;
    existingJob.jobLocation = jobLocation;
    existingJob.lastDateToApply = lastDateToApply;
    existingJob.requiredSkills = requiredSkills;
    existingJob.jobDescription = jobDescription;
    existingJob.qualification = qualification;

    await existingJob.save();

    res.status(200).json({ message: 'Job updated successfully', job: existingJob });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//list job

export const listActiveJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, filterData } = req.body;
    const searchText = filterData?.search || ''; 
    const userApplications: mongoose.Types.ObjectId[] = await JobApplication.find({
      applicantId: userId,
      isDeleted: { $ne: true },
      
    }).distinct('jobId');
    const filterCriteria: any = {
      isDeleted: { $ne: true },
      userId: { $ne: userId },
      isAdminBlocked: false,
      isBlocked:false,
      // _id: { $nin: userApplications },
    };

    if (filterData) {
      if (filterData.jobRole) {
        filterCriteria.jobRole = filterData.jobRole;
      }
      if (filterData.location) {
        filterCriteria.jobLocation = filterData.location;
      }
      if (filterData.jobType) {
        filterCriteria.jobType = filterData.jobType;
      }
      if (filterData.salaryRange && filterData.salaryRange != 0) {
      

        const maxSalary = parseFloat(filterData.salaryRange);
        filterCriteria.salary = { $lte: maxSalary };
      }
      if (filterData.experienceRange && filterData.experienceRange != 0) {
        
        const maxExp = parseFloat(filterData.experienceRange);
        filterCriteria.experience = { $lte: maxExp };
      }

      if (searchText.trim() !== ''&& searchText!==null) {
        filterCriteria.jobRole = { $regex: searchText.trim(), $options: 'i' };
      }
    }

    const jobs: IJob[] = await Job.find(filterCriteria)
      .populate({ path: 'userId', select: 'username profileImageUrl' });
    res.status(200).json({ jobs });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

//list job

export const listUserJobs = async (req: Request, res: Response): Promise<void> => {
  try {
 const{userId}=req.body

 const jobs: IJob[] = await Job.find({ userId: userId, isDeleted: { $ne: true } })
 .populate({
   path: 'userId',
   select: 'username profileImageUrl',
 })
 .exec();

    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error listing active jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//get job details
export const jobDetails = async (req: Request, res: Response): Promise<void> => {
  try {
 const{jobId}=req.body


 const job= await Job.findOne({ _id: jobId, isDeleted: { $ne: true } })
 .populate({
   path: 'userId',
   select: 'username profileImageUrl',
 })
 .exec();

    res.status(200).json({ job });
  } catch (error) {
    console.error('Error listing active jobs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//add job application
export const addJobApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      applicantId,
      jobId,
      applicationStatus,
      coverLetter,
    } = req.body;

    const resume = req.file?.filename; 

    if (!resume) {
      res.status(400).json({ message: 'No Resume uploaded' });
      return;
    }


    const existingApplication = await JobApplication.findOne({
      applicantId,
      jobId,
    });

    if (existingApplication) {
      res.status(400).json({ message: 'You have already applied for this job' });
      return;
    }

    const newJobApplication = new JobApplication({
      applicantId,
      jobId,
      applicationStatus,
      coverLetter,
      resume,
    });

    await newJobApplication.save();

    await User.updateOne({ _id: applicantId }, { $inc: { dailyJobsApplied: 1 } });

    res.status(201).json({success:true, message: 'Job application submitted ', jobApplication: newJobApplication });
  } catch (error) {
    console.error('Error adding job application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
//update application status
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  console.log("reached updateApplicationStatus ");
  
  try {
    const { applicationId,status,userId } = req.body; 
    const jobApplication = await JobApplication.findById(applicationId).populate({
      path:'jobId',
      select:'userId'
    });

    if (!jobApplication) {
      res.status(404).json({ message: 'Job application not found' });
      return;
    }

    jobApplication.applicationStatus = status;
    await jobApplication.save();
    const jobs = await Job.find({ userId });
    const job = await Job.findOne({_id:jobApplication.jobId})
    const jobIds = jobs.map((job) => job._id);
    const applications = await JobApplication.find({ jobId: { $in: jobIds }})
    .populate({
      path: 'applicantId',
      select: 'username profileImageUrl profile.fullname profile.designation companyProfile.companyName',
    })
    .populate('jobId')
    .exec();

    const jobSpecificApplications = await JobApplication.find({ jobId:jobApplication.jobId }) .populate('applicantId').populate('jobId')
    .exec();

    

    res.status(200).json({ message: `Job application ${status} successfully`, applications,jobSpecificApplications });
  } catch (error) {
    console.error('Error accepting job application:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//get employee applications
export const employeeApplications = async (req: Request, res: Response): Promise<void> => {
  console.log("reached  employeeApplications ");
  
  try {

    
    const { applicantId } = req.body;
    console.log(applicantId);
    const applications = await JobApplication.find({applicantId:applicantId })
      .populate({
        path: 'jobId',
        select: 'jobRole companyName jobLocation salary',
      })
      .exec();
      console.log(applications);
      

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching employee applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//viewjob
export const viewJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.body;
    // Get job details
    const job = await Job.findOne({ _id: jobId, isDeleted: { $ne: true } })
      .populate({
        path: 'userId',
        select: 'username profileImageUrl',
      })
      .exec();

    // Get job applications
    const applications = await JobApplication.find({ jobId,
      isDeleted: { $ne: true }}) .populate('applicantId').populate('jobId')
      .exec();
    res.status(200).json({ success: true, job, applications });
  } catch (error) {
    console.error('Error fetching job and applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




//get employeer applications
export const employerApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body;
    const jobs = await Job.find({ userId });
    const jobIds = jobs.map((job) => job._id);

    const applications = await JobApplication.find({ jobId: { $in: jobIds } }) .populate('applicantId').populate('jobId')
      .exec();

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//get all job details
export const getAllJobDetails = async (req: Request, res: Response): Promise<void> => {

  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    const applications = await JobApplication.find({ jobId })
      .populate({
        path: 'applicantId',
        select: 'username profileImageUrl profile.fullname profile.designation',
      })
      .exec();

    res.status(200).json({ success: true, job, applications });
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


//cancel job application request
export const cancelJobApplication = async (req: Request, res: Response): Promise<void> => {
 
  try {
    const { applicationId } = req.body;
    const jobApplication = await JobApplication.findByIdAndUpdate(
      applicationId,
      { isCanceled: true },
      { new: true }
    );

    if (!jobApplication) {
      res.status(404).json({ success: false, message: 'Job application not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Job application canceled successfully', jobApplication });
  } catch (error) {
    console.error('Error canceling job application:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// @desc    Block job
// @route   USER /user/block-user
// @access  Private

export const userJobBlock = asyncHandler(async (req: Request, res: Response) => {
  const jobId = req.body.jobId; 
  const job = await Job.findById(jobId)
  if (!job) {
    res.status(400);
    throw new Error('Post not found');
  }
  const userId=job?.userId

  job.isBlocked = !job.isBlocked;
  await job.save();

  const jobs: IJob[] = await Job.find({ userId: userId, isDeleted: { $ne: true }})
  .populate('userId')
  .exec();
 
  const blocked = job.isAdminBlocked?"Blocked":"Unblocked"

  res.status(200).json({ jobs,message:`Job has been ${blocked}`});
});

export const getFormSelectData = async (req: Request, res: Response): Promise<void> => {
  try {
    const distinctLocations= await Job.distinct('jobLocation').sort();
    const distinctRoles = await Job.distinct('jobRole').sort();

    res.status(200).json({ locations: distinctLocations, roles: distinctRoles });
  } catch (error) {
    console.error('Error fetching distinct job data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
