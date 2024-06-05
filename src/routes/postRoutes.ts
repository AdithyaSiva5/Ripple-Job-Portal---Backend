import express from 'express'
import { addPost,getPost,editPost,getUserPost,deletePost} from '../controllers/postController';
const router = express.Router()

router.post('/add-post',addPost);
router.get('/get-post',getPost);
router.post('/edit-post',editPost);
router.post('/get-user-post',getUserPost);
router.post('/delete-post',deletePost);
export default router;