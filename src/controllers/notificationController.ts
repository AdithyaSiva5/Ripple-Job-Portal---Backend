import { Request, Response } from 'express';
import Notification from '../models/notifications/notificationsModel';
import Connections from '../models/connections/connectionModel'; 
import { INotification } from '../models/notifications/notificationsType';


interface NotificationData extends INotification {
  senderConnections?: any[]; 
}

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    
  try {
    const userId = req.body.userId; 

    const connections = await Connections.findOne({ userId });
    const userConnections: any[] = connections?.connections || [];

    const notifications: NotificationData[] = await Notification.find({ receiverId: userId }).populate({
        path: 'senderId',
        select: 'username profileImageUrl'
      })

    res.status(200).json({ notifications: notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
