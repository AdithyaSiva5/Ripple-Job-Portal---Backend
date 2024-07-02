import { Schema, model } from "mongoose";
import ReportInterface from "./reportTypes";

const ReportSchema = new Schema<ReportInterface>({
    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    postId : {
        type : Schema.Types.ObjectId,
        ref : 'Post',
        required : true
    },
    jobId : {
        type: Schema.Types.ObjectId,
        ref : 'Job'
    },
    cause :{type : String , required : true}
})

const Report = model<ReportInterface>('Report',ReportSchema);

export default Report;