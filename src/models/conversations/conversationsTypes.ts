import { Document,Types } from "mongoose";

export interface Conversation {
  members: Types.ObjectId[];
  lastMessage:string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationDocument extends Conversation, Document {}