import express from 'express'
import { addPost,getPost,editPost,getUserPost,deletePost,likePost, reportPostController} from '../controllers/postController';
import { protect } from '../middlewares/auth';
import { addComment, addReplyComment, deletePostComment, getCommentsByPostId, getSavedPostController, savePostController } from '../controllers/commentController';


const router = express.Router()
router.get('/delete-post-comment', protect,deletePostComment);
router.post('/add-post', protect,addPost);
router.get('/get-post', protect,getPost);
router.post('/edit-post', protect,editPost);
router.post('/get-user-post', protect,getUserPost);
router.post('/delete-post', protect,deletePost); 
router.post('/like-post', protect,likePost);
router.post('/get-post-comments', protect,getCommentsByPostId);
router.post('/add-comment',protect,addComment)
router.post('/report-post',protect,reportPostController)
router.post('/reply-comment',protect,addReplyComment)
router.post( "/save-post",protect,savePostController);
router.get("/user-saved-post/:userId",protect, getSavedPostController);



export default router;