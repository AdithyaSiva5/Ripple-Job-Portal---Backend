import express, { Express, Request, Response } from 'express'
import { Login,getUsers,userBlock ,getPosts,postBlock,addJobCategory,getJobCategory,blockJobCategory} from '../controllers/adminController';
import { protectAdmin } from '../middlewares/adminAuth';
const router = express.Router()

router.post('/login',Login);
router.get('/get-users',protectAdmin,getUsers);
router.get('/get-posts',protectAdmin,getPosts);
router.post('/user-block',protectAdmin,userBlock);
router.post('/post-block',protectAdmin,postBlock);
router.get('/job-category',protectAdmin,getJobCategory);
router.post('/add-job-category',protectAdmin,addJobCategory);
router.post('/block-job-category',protectAdmin,blockJobCategory);

export default router