import { Types } from 'mongoose';
import Notification from '../models/notifications/notificationsModel';
import { INotification } from '../models/notifications/notificationsType';

interface NotificationArgs {
  senderId: Types.ObjectId|undefined|any;
  receiverId: Types.ObjectId|undefined|any;
  message: string|any;
  link: string|any;
  read?: boolean;
  jobId?: Types.ObjectId|undefined|any;
  applicationId?: Types.ObjectId|undefined|any;
  postId?: Types.ObjectId|undefined|any; 
}


export const createNotification = async (args: NotificationArgs): Promise<INotification> => {
  try {   
    const {
      senderId,
      receiverId,
      message,
      link,
      read = false, 
      jobId,
      applicationId,
      postId,
    } = args;
    const newNotification = new Notification({
      senderId,
      receiverId,
      message,
      link,
      read,
      jobId,
      applicationId,
      postId,
    });
    const savedNotification = await newNotification.save();
    return savedNotification;
  } catch (error) {
    throw new Error('Error creating notification');
  }
};
