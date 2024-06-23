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
const router = express.Router();


router.post('/follow',followUser);
router.post('/unfollow',unFollowUser);
router.post('/accept-request',acceptRequest);
router.post('/reject-request',rejectRequest);
router.post('/get-requested-users',getFollowRequests);
router.post('/get-connection',getConnection); 
router.post('/cancel-request',cancelFollowRequest);
export default router;