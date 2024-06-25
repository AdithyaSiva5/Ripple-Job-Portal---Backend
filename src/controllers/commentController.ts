import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment from '../models/comments/commentsModel'
import { Document, Types } from 'mongoose';


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


    const newComment= await  Comment.create({
      postId,
      userId,
      comment,
    });
  

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
