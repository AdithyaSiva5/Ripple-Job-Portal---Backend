
import { Document, Schema, model, Types } from 'mongoose';

export interface IInterview extends Document {
  interviewerId: Types.ObjectId;
  intervieweeId: Types.ObjectId;
  applicationId: Types.ObjectId;
  jobId: Types.ObjectId;
  jury: Types.ObjectId[];
  interviewDate: Date;
  interviewTime: string;
  interviewLink: string;
  status: string;
}

