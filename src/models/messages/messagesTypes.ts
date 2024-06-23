import { Document ,Types} from 'mongoose';

export interface Message {
  conversationId: string;
  sender:Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument extends Message, Document {}