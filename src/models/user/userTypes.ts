// types.ts

import { Date, Document, Types } from 'mongoose';

export interface Qualification {
  course: string;
  institution: string;
  yearOfCompletion: number;
}


export interface Experience {
  jobPosition: string;
  yearOfJoining: number;
  companyName: string;
}


export enum UserType {
  Company = 'organization',
  Individual = 'individual',
}



// Define the profile schema
export interface Profile {
  about?: string;
  location?: string;
  qualification?: Qualification[];
  experience?: Experience[];
  skills?: string[];
  resume?: string;
  gender?: string;
  dateOfBirth?:Date;
  designation?:string;
  fullname?:string;
}

// Define the company profile schema
export interface CompanyProfile {
  companyName?: string;
  companyLocation?: string;
  aboutCompany?: string;
  noOfEmployees?: string;
  establishedOn?:Date;
  companyType?:string;
}

// Define the user document interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isHiring: boolean;
  isBlocked: boolean;
  isGoogle:boolean;
  isFacebook:boolean;
  isOnline: boolean;
  userType: UserType;
  profile: Profile;
  companyProfile: CompanyProfile;
  phone: string;
  savedPosts: Types.ObjectId[];
  savedJobs: Types.ObjectId[];
  isActive: boolean;
  profileImageUrl: string;
  timestamp: Date;
}
