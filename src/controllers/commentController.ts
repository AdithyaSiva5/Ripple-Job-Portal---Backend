import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment from '../models/comments/commentsModel'
import mongoose, { Document, Types } from 'mongoose';
import User from '../models/user/userModel';
import Post from '../models/post/postModel';
import Job from '../models/jobs/jobModel';
import { createNotification } from '../utils/notificationSetter';


// @desc    Get all comments of a post
// @route   GET /post/get-comment
// @access  Private

export const getCommentsByPostId = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.body.postId;
    console.log(postId);
    

    const comments = await Comment.find({ postId:postId,isDeleted:false  }) .populate({
      path: 'userId',
      select: 'username profileImageUrl',
    })
    .populate({
      path: 'replyComments.userId',
      select: 'username profileImageUrl',
    }).sort({createdAt:-1})
  
    res.status(200).json({ comments });
  });



// @desc    Add a comment
// @route   POST /post/add-comment
// @access  Private

  export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId, comment } = req.body;
    const post = await Post.findById(postId);


    const newComment= await  Comment.create({
      postId,
      userId,
      comment,
    });
    const userIdObj = new mongoose.Types.ObjectId(userId);
    if   (!userIdObj.equals(post?.userId)) {
      const notificationData = {
        senderId:userId,
        receiverId: post?.userId,
        message: 'commented on your post',
        link: `/visit-profile/posts/${post?.userId}`, 
        read: false, 
        postId:postId
      };
      createNotification(notificationData)
    }

    await newComment.save();
    const comments = await Comment.find({ postId:postId ,isDeleted:false }) .populate({
      path: 'userId',
      select: 'username profileImageUrl',
    })
    .populate({
      path: 'replyComments.userId',
      select: 'username profileImageUrl',
    })
  
    res.status(200).json({ message: 'Comment added successfully', comments });
  });



// @desc    Delete a comment
// @route   POST /post/delete-comment
// @access  Private
  export const deletePostComment = asyncHandler(async (req: Request, res: Response) => {
    const {commentId }= req.query;
    console.log(req.query);
    

  
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    await comment.save();

    const comments = await Comment.find({ postId: comment.postId,isDeleted:false }) .populate({
      path: 'userId',
      select: 'username profileImageUrl',
    })
    .populate({
      path: 'replyComments.userId',
      select: 'username profileImageUrl',
    }).sort({createdAt:-1})
  
    res.status(200).json({ message: "Comment deleted successfully", comments });
  });

  // @desc    reply comment
// @route   POST /post/reply-comment
// @access  Private 
export const addReplyComment = asyncHandler(async (req, res) => {
  console.log("reached replu");
  
  const { commentId,userId, replyComment } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const newReplyComment = {
    userId,
    replyComment,
    timestamp: new Date(), 
  };

  comment.replyComments.push(newReplyComment);
  await comment.save();

  const comments = await Comment.find({ postId:comment.postId,isDeleted:false}) .populate({
    path: 'userId',
    select: 'username profileImageUrl',
  })
  .populate({
    path: 'replyComments.userId',
    select: 'username profileImageUrl',
  })

  res.status(200).json({ message: 'Reply comment added successfully', comments });
});


// @desc    Save Post
// @route   POST /post/like-post
// @access  Public

export const savePostController = asyncHandler(
  async (req: Request, res: Response) => {
    
    
    const { postId,jobId ,userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
if(postId){
  const isSavedPosts = user.savedPosts.includes(postId);
  if (isSavedPosts) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { savedPosts: postId } },
      { new: true }
    );
  } else {
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { savedPosts: postId } },
      { new: true }
    );
  }

}
if(jobId){
  const isSavedJobs = user.savedJobs.includes(jobId);
  if (isSavedJobs) {
    await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { savedJobs: jobId } },
      { new: true }
    );
  } else {
    await User.findOneAndUpdate(
      { _id: userId },
      { $push: { savedJobs: jobId } },
      { new: true }
    );
  }

}

const UpdatedUser=await User.findOne({_id:userId})

res.status(201).json({ user:UpdatedUser});
  }
);

// @desc    Get User Saved Posts
// @route   get /post/get-saved-post
// @access  Public

export const getSavedPostController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.userId;
    const user = await User.findOne(
      { _id: id, isBlocked: false },
      { savedPosts: 1,savedJobs:1, _id: 0 }
    );
    if (user) {
      const savedPostIds = user.savedPosts;
      const posts = await Post.find({ _id: { $in: savedPostIds } }).populate(
        "userId"
      );
      const savedJobIds = user.savedJobs;
      const jobs = await Job.find({ _id: { $in: savedJobIds } }).populate(
        "userId"
      );

      res.status(200).json({posts,jobs});
    } else {
      res.status(400);
      throw new Error("User Not Found");
    }
  }
);
