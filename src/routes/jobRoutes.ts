import express from "express";
import {
addJob, addJobApplication, cancelJobApplication, editJob, employeeApplications, employerApplications, getAllJobDetails, getFormSelectData, jobDetails, listActiveJobs,
listUserJobs,
updateApplicationStatus,
userJobBlock,
viewJob
} from "../controllers/jobController";
import { Request, Response, NextFunction } from 'express';

import multer, { Multer } from 'multer'; 
import path from 'path';
import fs from 'fs';
import { protect } from "../middlewares/auth";
import { addInterview, editInterview, getInterviewsByIntervieweeId, getInterviewsByInterviewerId, getInterviewsByJobId, setInterviewStatus } from "../controllers/interviewController";


const router = express.Router();

 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/public/uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

  
const upload = multer({ storage });

upload.any();


router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  
  if (err instanceof multer.MulterError) {
  
    console.error('Multer error:', err);
    res.status(400).json({ error: 'File upload failed', message: err.message });
  } else {
    
    console.error('Other error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add-job',protect,addJob);
router.put('/edit-job',protect,editJob);
router.post('/view-job',protect,viewJob);
router.post('/list-all-job',protect,listActiveJobs);
router.post('/list-user-job',protect,listUserJobs)
router.post('/job-details',protect,jobDetails)
router.post('/apply-job',upload.single('resume'),addJobApplication)
router.patch('/update-application-status',protect,updateApplicationStatus)
router.post('/get-applications-employee',protect,employeeApplications)
router.post('/get-applications-empolyer',protect,employerApplications)
router.post('/get-all-job-details',protect,getAllJobDetails)
router.patch('/cancel-job-application',protect,cancelJobApplication)
router.post('/add-interview',protect,addInterview)
router.put('/edit-interview',protect,editInterview)
router.patch('/set-interview-status',protect,setInterviewStatus)
router.post('/get-interviewee-interviews',protect,getInterviewsByIntervieweeId)
router.post('/get-interviewer-interviews',protect,getInterviewsByInterviewerId)
router.post('/get-job-interviews',protect,getInterviewsByJobId)
router.get('/form-select-data',protect,getFormSelectData)
router.post('/block-job',userJobBlock);


export default router; 