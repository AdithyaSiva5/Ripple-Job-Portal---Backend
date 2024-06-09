// userModel.ts

import mongoose, { Schema } from 'mongoose';
import { IUser, UserType } from './userTypes';

// Create the user schema
const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isHiring: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isGoogle:{type:Boolean,default:false},
  isFacebook:{type:Boolean,default:false},
  userType: { type: String, enum: Object.values(UserType)},
  profile: {
    type: {
      about: { type: String },
      location: { type: String },
      qualification: [{ course: String, institution: String, yearOfCompletion: Number }],
      experience: [{ jobPosition: String, yearOfJoining: Number, companyName: String }],
      skills: [{ type: String }],
      resume: { type: String },
      gender: { type: String },
    },
   
  },
  companyProfile: {
    type: {
      companyName: { type: String },
      companyLocation: { type: String },
      aboutCompany: { type: String },
      noOfEmployees: { type: Number },
    },
  },
  phone: { type: String },
  savedPosts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
  savedJobs: [{ type: mongoose.Types.ObjectId, ref: 'Job' }],
  isActive: { type: Boolean, default: true },
  profileImageUrl: { type: String ,default:'./src/assets/default_user_profile.png'},
  
},{timestamps:true});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
