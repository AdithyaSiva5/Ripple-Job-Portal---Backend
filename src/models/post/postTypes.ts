import { Document, Types } from "mongoose";

interface PostInterface extends Document {
    userId: Types.ObjectId;
    imageUrl: string;
    title: string;
    description: string;
    date: Date;
    likes: Types.ObjectId[];
    isHidden: boolean;
    isBlocked: boolean;
    hideComment: boolean;
    hideLikes:boolean;
    isDeleted:boolean;
    timestamp: Date;
}

export default PostInterface;