import mongoose, { Schema } from "mongoose";
import JobCategoryInterface from "./jobCategoryTypes";


const JobCatergorySchema: Schema = new Schema({
    jobCategory: { type: String, required: true },
    jobs: { type: [Schema.Types.ObjectId], ref: 'Post',defalut:[] },
    date: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false }
  });
  
  const JobCategory = mongoose.model<JobCategoryInterface>('JobCategory', JobCatergorySchema);
  
  export default JobCategory;