import { model, Schema } from "mongoose";
import { ConversationDocument } from "./conversationsTypes";

const ConversationSchema = new Schema<ConversationDocument>(
  {
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      required: true,
    },
    lastMessage:{
      type:String
    }
  },
  { timestamps: true }
);

const Conversation = model<ConversationDocument>(
  "Conversation",
  ConversationSchema
);

export default Conversation;