import { Request, Response } from "express";
import Notification from "../models/notifications/notificationsModel";
import Connections from "../models/connections/connectionModel";
import { INotification } from "../models/notifications/notificationsType";
import { RequestWithToken } from "../middlewares/RequestWithToken";

interface NotificationData extends INotification {
  senderConnections?: any[];
}

export const getNotifications = async (
  req: RequestWithToken,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;

    const connections = await Connections.findOne({ userId });
    const userConnections: any[] = connections?.connections || [];

    const notifications: NotificationData[] = await Notification.find({
      receiverId: userId,
    })
      .sort({ _id: -1 })
      .populate({
        path: "senderId",
        select: "username profileImageUrl",
      });

    res.status(200).json({ notifications: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const clearnotification = async(
  req: RequestWithToken,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ receiverId: userId });
    res.status(200).json({ message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error("Error Clearing notifications:", error);
    res.status(500).json({ message: "Error Clearing notifications" });
  }
};