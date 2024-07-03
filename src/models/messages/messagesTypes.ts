import { Document ,Types} from 'mongoose';

export interface Message {
  conversationId: string;
  sender:Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  isRead:boolean;
}

export interface MessageDocument extends Message, Document {}