import { Document, Types } from "mongoose";

interface  jobApplicationInterface extends Document {
    applicantId: Types.ObjectId;
    jobId: Types.ObjectId;
    applicationStatus: string;
    coverLetter: string;
    resume: string;
    isDeleted:boolean;
    timestamp: Date;
}

export default jobApplicationInterface;