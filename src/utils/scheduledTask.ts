import cron from "node-cron";

import User from "../models/user/userModel";
async function runScheduledTask() {
  try {
    const users = await User.find({});

    for (const user of users) {
      const expiryDate: unknown = user.premiumExpiryDate;

      if (expiryDate instanceof Date) {
        const expiryDateAsDate: Date = expiryDate;
        if (expiryDateAsDate < new Date()) {
          user.isPremium = false;
        }
      }
      user.dailyJobsApplied = 0;
      await user.save();
    }

    console.log("Cron job executed successfully");
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
}

cron.schedule("0 0 * * *", runScheduledTask);

export default runScheduledTask;
