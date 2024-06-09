
import { Schema, model, Document, Types } from 'mongoose';
import CommentInterface from "./commentTypes";

const CommentSchema = new Schema<CommentInterface>({
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },{timestamps:true});
  
  const Comment = model<CommentInterface>('Comment', CommentSchema);
  
  export default Comment;