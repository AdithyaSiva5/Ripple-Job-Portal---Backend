// src/utils/interviewNotifications.ts

import nodemailer from 'nodemailer';
import User from '../models/user/userModel';
import Job from '../models/jobs/jobModel';
import { format } from 'date-fns';
import { IInterview } from '../models/interview/interviewTypes';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD
  }
});

interface EmailDetails {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(emailDetails: EmailDetails): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_EMAIL,
      ...emailDetails
    });
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function handleInterviewNotification(interview: IInterview, isReminder: boolean = false): Promise<boolean> {
  try {
    const { interviewerId, intervieweeId, jobId, interviewDate, interviewTime, interviewLink, jury } = interview;

    const [interviewee, interviewer, job] = await Promise.all([
      User.findById(intervieweeId),
      User.findById(interviewerId),
      Job.findById(jobId)
    ]);

    if (!interviewee || !interviewer || !job) {
      throw new Error('Unable to fetch all required details');
    }

    const juryMembers = await User.find({ _id: { $in: jury } });
    const juryNames = juryMembers.map(member => member.username).join(', ');

    const formattedDate = format(new Date(interviewDate), 'MMMM d, yyyy');

    const emailSubject = isReminder ? 'Interview Reminder' : 'Interview Scheduled';
    const actionPhrase = isReminder ? 'is tomorrow' : 'has been scheduled';

    const emailContent = `
      <h1>${emailSubject}</h1>
      <p>Dear ${interviewee.username},</p>
      <p>Your interview for the position of ${job.jobRole} at ${job.companyName} ${actionPhrase}.</p>
      <p>Details:</p>
      <ul>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${interviewTime}</li>
        <li>Interviewer: ${interviewer.username}</li>
        <li>Jury Members: ${juryNames}</li>
        <li>Interview Link: ${interviewLink}</li>
      </ul>
      <p>Please be prepared and punctual for your interview.</p>
      <p>Good luck!</p>
    `;

    const emailDetails: EmailDetails = {
      to: interviewee.email,
      subject: emailSubject,
      html: emailContent
    };

    return await sendEmail(emailDetails);
  } catch (error) {
    console.error(`Error handling interview ${isReminder ? 'reminder' : 'notification'}:`, error);
    return false;
  }
}