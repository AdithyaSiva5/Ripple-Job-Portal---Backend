import Post from "../models/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

// @desc    Create new post
// @route   POST /post/create-post
// @access  Public

export const addPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId, imageUrl,title, description ,hideLikes,hideComment } = req.body;
    console.log(userId,imageUrl, description,hideLikes,hideComment)
  if (!userId || !imageUrl || !description) {
    res.status(400);
    throw new Error("Provide all details");
  }
  const post = await Post.create({
    userId,
    imageUrl,
    title,
    description,
    hideComment,
    hideLikes,
  });

  if (!post) {
    res.status(400);
    throw new Error("Cannot add post");
  }
  res.status(200).json({ message: "Post added successfully" });
});

// @desc    Get all Posts
// @route   get /post/get-post
// @access  Public

export const getPost = asyncHandler(async (req: Request, res: Response) => {
    const posts = await Post.find({ isBlocked: false ,isDeleted:false  }).populate({
      path: 'userId',
      select: ' username profileImageUrl'
    }).sort({date:-1});
   
    
    res.status(200).json(posts);
  });




  // @desc    Get User Posts
// @route   get /post/get-post
// @access  Public

export const getUserPost = asyncHandler(async (req: Request, res: Response) => {

  
  
  const id = req.body.userId;

  const posts = await Post.find({userId:id, isBlocked: false, isDeleted:false  }).populate({
    path: 'userId',
    select: 'username profileImageUrl'
  }).sort({date:-1});

  if (posts.length==0) {
    res.status(400);
    throw new Error("No Post available");
  }
  
  res.status(200).json(posts);

});

// @desc    Edit Post
// @route   POST /post/update-post
// @access  Public

export const editPost = asyncHandler(async (req: Request, res: Response) => {
  
  const {userId,postId,title, description, hideComment, hideLikes } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(400);
    throw new Error("Post cannot be found");
  }

  if (title) post.title = title;
  if (description) post.description = description;
  if (hideComment !== undefined) post.hideComment = hideComment;
  if (hideLikes !== undefined) post.hideLikes = hideLikes;

  await post.save();
  
  const posts = await Post.find({userId:userId, isBlocked: false, isDeleted:false  }).populate({
    path: 'userId',
    select: 'username profileImageUrl'
  }).sort({date:-1});
  res.status(200).json(posts);

  
  

  
});


// @desc    Delete Post
// @route   POST /post/delete-post
// @access  Public
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    
  const {postId,userId} = req.body;
  console.log(postId,userId)
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error("Post Cannot be found")
    }

    post.isDeleted = true;
    await post.save();
    const posts = await Post.find({userId:userId, isBlocked: false,isDeleted:false }).populate({
      path: 'userId',
      select: 'username profileImageUrl'
    }).sort({date:-1});

    res.status(200).json({ posts });
  
});

// @desc    Like Post
// @route   POST /post/like-post
// @access  Public

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { postId, userId } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const isLiked = post.likes.includes(userId);

  if (isLiked) {
  
    await Post.findOneAndUpdate({_id: postId}, {$pull: {likes: userId}}, {new: true})
  } else {
 
    await Post.findOneAndUpdate({_id: postId}, {$push: {likes: userId }}, {new: true})
  }


  const posts = await Post.find({userId:userId, isBlocked: false,isDeleted:false }).populate({
    path: 'userId',
    select: 'username profileImageUrl'
  }).sort({date:-1});

  res.status(200).json({ posts });
});