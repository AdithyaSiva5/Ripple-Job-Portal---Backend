import mongoose, { Schema, Document } from "mongoose";
import { IJob } from "./jobTypes";

const jobSchema: Schema<IJob> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  jobRole: {
    type: String,
  },
  experience: {
    type: String,
    required: true,
  },
  salary: {
    type: String,
  },
  jobType: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  lastDateToApply: {
    type: Date,
    required: true,
  },
  requiredSkills: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
  },
  qualification: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Job = mongoose.model<IJob>('Job', jobSchema);
export default Job;