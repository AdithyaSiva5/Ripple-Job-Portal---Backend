import { Document,Types } from "mongoose";

interface ConnectionInterface extends Document {
    userId:  Types.ObjectId;
    connections:Types.ObjectId[];
    requested:  Types.ObjectId[];
    requestSent:  Types.ObjectId[];
}

export default ConnectionInterface