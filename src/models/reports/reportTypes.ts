import { Document,Schema,Types } from "mongoose";

interface ReportInterface extends Document {
    userId : Types.ObjectId;
    postId : Types.ObjectId;
    jobId: Types.ObjectId;
    cause : string;
}

export default ReportInterface;