
import { Schema, model, Types } from 'mongoose';
import { IInterview } from './interviewTypes';


const interviewSchema = new Schema<IInterview>(
  {
    interviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    intervieweeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jury: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      default: [],
    },
    interviewDate: {
      type: Date,
      required: true,
    },
    interviewTime: {
      type: String,
      required: true,
    },
    interviewLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Pending',
    },
  },
  { timestamps: true }
);


const Interview = model<IInterview>('Interview', interviewSchema);

export default Interview;
