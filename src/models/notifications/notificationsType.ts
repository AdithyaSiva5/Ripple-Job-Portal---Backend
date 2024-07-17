
import { Document, Schema, model, Types } from 'mongoose';


export interface INotification extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  postId?: Types.ObjectId;
  jobId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  message: string;
  link: string;
  read: boolean;
  createdAt: Date;
}
