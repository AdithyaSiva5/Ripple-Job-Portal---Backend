import express from "express";
import {
addJob, listActiveJobs
} from "../controllers/jobController";
const router = express.Router();


router.post('/add-job',addJob);
router.post('/list-all-job',listActiveJobs);

export default router;