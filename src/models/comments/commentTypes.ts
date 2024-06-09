

import { Schema, model, Document, Types } from 'mongoose';




interface CommentInterface extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  isDeleted: boolean;
  timestamp: Date;
}

export default CommentInterface;