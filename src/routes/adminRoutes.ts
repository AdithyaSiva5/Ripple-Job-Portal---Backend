import express, { Express, Request, Response } from 'express'
import { Login,getUsers,userBlock ,getPosts,postBlock,addJobCategory,getJobCategory,blockJobCategory, getJobs, jobBlock} from '../controllers/adminController';
import { protectAdmin } from '../middlewares/adminAuth';
const router = express.Router()

router.post('/login',Login);
router.get('/get-users',protectAdmin,getUsers);
router.get('/get-posts',protectAdmin,getPosts);
router.get('/get-jobs',protectAdmin,getJobs);
router.post('/user-block',protectAdmin,userBlock);
router.post('/post-block',protectAdmin,postBlock);
router.post('/job-block',protectAdmin,jobBlock);
router.get('/job-category',protectAdmin,getJobCategory);
router.post('/add-job-category',protectAdmin,addJobCategory);
router.post('/block-job-category',protectAdmin,blockJobCategory);

export default router