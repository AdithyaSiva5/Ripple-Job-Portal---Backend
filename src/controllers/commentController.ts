import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment from '../models/comments/commentsModel'
import User from '../models/user/userModel';

// @desc    Get all comments of a post
// @route   GET /post/get-comment
// @access  Private

export const getCommentsByPostId = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId;

    const comments = await Comment.find({ postId: postId }).populate({
        path: 'userId',
        select: 'username profileImageUrl', 
      });
  
    res.status(200).json({ comments });
  });



// @desc    Add a comment
// @route   POST /post/add-comment
// @access  Private

  export const addComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId, userId, content } = req.body;
  
    const newComment = new Comment({
      postId,
      userId,
      content,
    });

    await newComment.save();
  
    const comments = await Comment.find({ postId: postId }).populate({
        path: 'userId',
        select: 'username profileImageUrl',
      });
  
    res.status(201).json({ message: 'Comment added successfully', comments });
  });



// @desc    Delete a comment
// @route   POST /post/delete-comment
// @access  Private
  export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
    const commentId = req.body.commentId;
  
    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    await comment.save();

    const comments = await Comment.find({ postId: comment.postId }).populate({
        path: 'userId',
        select: 'username profileImageUrl', 
      });
  
    res.status(200).json({ message: "Comment deleted successfully", comments });
  });