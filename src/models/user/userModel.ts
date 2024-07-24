import mongoose, { Schema } from 'mongoose';
import { IUser, UserType } from './userTypes';

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  
  password: { type: String, required: true },
  isHiring: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isGoogle:{type:Boolean,default:false},
  isFacebook:{type:Boolean,default:false},
  isPremium:{type:Boolean,default:false},
  dailyJobsApplied:{type:Number,default:0},
  premiumExpiryDate:{type:Date,required:false},
  userType: { type: String, enum: Object.values(UserType)},
  profile: {
      fullname:{type:String},
      about: { type: String },
      location: { type: String },
      qualification: [{ course: String, institution: String, yearOfCompletion: Number }],
      experience: [{ jobPosition: String, yearOfJoining: Number, companyName: String }],
      skills: [{ type: String }],
      resume: { type: String },  
      gender: { type: String },
      dateOfBirth:{type:Date},
      designation:{type:String}, 
  },
  companyProfile: {
   
      companyName: { type: String },
      companyLocation: { type: String },
      aboutCompany: { type: String },
      noOfEmployees: { type: Number },
      establishedOn:{type:Date},
      companyType:{type:String}
   
  },
  phone: { type: String },
  savedPosts: [{ type: mongoose.Types.ObjectId, ref: 'Post' }],
  savedJobs: [{ type: mongoose.Types.ObjectId, ref: 'Job' }],
  isActive: { type: Boolean, default: true },
  profileImageUrl: { type: String ,default:'https://i.postimg.cc/8z7vvppS/default-user-profile.png'},
  
},{timestamps:true});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
