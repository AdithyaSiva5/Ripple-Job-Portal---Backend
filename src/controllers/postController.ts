import Post from '../models/post/postModel'
import { Request , Response} from 'express'
import asyncHandler from 'express-async-handler'

export const addPost = asyncHandler(async(req:Request,res:Response)=>{
    const { userId , imageUrl, title, description, hideLikes , hideComment} = req.body
    console.log(userId,imageUrl, description,hideLikes,hideComment)
    if(!userId || !imageUrl || !description){
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
    })
    if(!post){
        res.status(400);
        throw new Error("Cannot add post")
    }
    res.status(200).json({message : "Post added successfully"})
})

export const getPost = asyncHandler(async (req: Request, res: Response)=>{
    const posts = await Post.find({ isBlocked : false}).populate({
        path: 'userId',
        select : 'username profileImageUrl'
    })
    console.log(posts);
    res.status(200).json(posts)
})

export const getUserPost = asyncHandler(async (req: Request, res: Response)=>{
    const id = req.body.userId;
    const posts = await Post.find({userId:id , isBlocked: false}).populate({
        path: 'userId',
        select: 'username profileImageUrl'
    }).sort({date : -1})
    res.status(200).json(posts)
})

export const editPost = asyncHandler(async(req: Request, res:Response)=>{
    const {userId,postId,title,description,hideComment,hideLikes} = req.body;
    const post = await Post.findById(postId);
    if(!post){
        res.status(400)
        throw new Error("Post cannot be found")
    }
    if(title) post.title = title;
    if(description) post.description = description;
    if(hideComment !== undefined) post.hideComment = hideComment;
    if(hideLikes !== undefined) post.hideLikes = hideLikes

    await post.save()
    
    const posts = await Post.find({userId:userId, isBlocked:false}).populate({
        path: 'userId',
        select: 'username profileImageUrl'
    }).sort({date:-1})
    res.status(200).json(posts)
})

export const deletePost = asyncHandler(async (req: Request,res:Response)=>{

    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if(!post){
        res.status(404)
        throw new Error("Post Cannot be found")
    }
    //   await Post.findOneAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" })
})