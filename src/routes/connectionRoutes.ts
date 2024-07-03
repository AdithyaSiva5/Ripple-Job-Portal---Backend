import express from "express";
import {
  followUser,
  unFollowUser,
  acceptRequest,
  rejectRequest,
  getFollowRequests,
  getConnection,
  cancelFollowRequest,
} from "../controllers/connectionController";
import { protect } from "../middlewares/auth";
const router = express.Router();


router.post('/follow',protect,followUser);
router.post('/unfollow',protect,unFollowUser);
router.post('/accept-request',protect,acceptRequest);
router.post('/reject-request',protect,rejectRequest);
router.post('/get-requested-users',protect,getFollowRequests);
router.post('/get-connection',protect,getConnection); 
router.post('/cancel-request',protect,cancelFollowRequest);
export default router;