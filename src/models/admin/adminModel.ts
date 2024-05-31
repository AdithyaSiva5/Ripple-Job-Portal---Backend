import mongoose, {Schema} from "mongoose"
import admin from "./adminTypes";

const adminSchema :Schema = new Schema<admin>({
    name:{
        type:String,
        required : true
    },
    email : {
        type:String,
        unique:true,
        required : true
    },
    password : {
        type: String,
        required:true
    },
    profileImg: {
        type:String,
        default: 'default_profile_image_url'
    },
})
const Admin = mongoose.model<admin>('Admin',adminSchema);
export default Admin;