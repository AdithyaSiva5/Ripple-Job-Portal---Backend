import { Document, Types } from "mongoose";

interface JobCategoryInterface extends Document {   
    jobCategory: string;
    jobs: Types.ObjectId[];
    date: Date;
    isBlocked: boolean;
}

export default JobCategoryInterface;