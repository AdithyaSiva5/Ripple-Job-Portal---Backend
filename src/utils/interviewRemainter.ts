// src/cron/interviewReminders.ts

import cron from 'node-cron';
import { handleInterviewNotification } from '../utils/interviewNotifications';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import Interview from '../models/interview/interviewModel';

async function sendInterviewReminders() {
  try {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStart = startOfDay(tomorrow);
    const tomorrowEnd = endOfDay(tomorrow);

    const interviews = await Interview.find({
      interviewDate: {
        $gte: tomorrowStart,
        $lte: tomorrowEnd
      }
    });

    for (const interview of interviews) {
      await handleInterviewNotification(interview, true);
    }

    console.log(`Sent reminders for ${interviews.length} interviews scheduled for tomorrow.`);
  } catch (error) {
    console.error('Error sending interview reminders:', error);
  }
}

export function scheduleInterviewReminders() {
  cron.schedule('0 9 * * *', sendInterviewReminders);
  console.log('Interview reminder cron job scheduled');
}