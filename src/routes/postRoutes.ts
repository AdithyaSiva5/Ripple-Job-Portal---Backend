import express from 'express'
import { addPost,getPost,editPost,getUserPost,deletePost,likePost} from '../controllers/postController';
import { protect } from '../middlewares/auth';
import { addComment, addReplyComment, getCommentsByPostId } from '../controllers/commentController';


const router = express.Router()

router.post('/add-post', protect,addPost);
router.get('/get-post', protect,getPost);
router.post('/edit-post', protect,editPost);
router.post('/get-user-post', protect,getUserPost);
router.post('/delete-post', protect,deletePost);
router.post('/like-post', protect,likePost);
router.post('/get-post-comments', protect,getCommentsByPostId);
router.post('/add-comment',protect,addComment)
router.post('/reply-comment',protect,addReplyComment)



export default router;