
import { Document, Schema, model, Types } from 'mongoose';
import { INotification } from './notificationsType';



const notificationSchema = new Schema<INotification>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'JobApplication',
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const Notification = model<INotification>('Notification', notificationSchema);


export default Notification;
