import { Request, Response } from "express";
import Interview from "../models/interview/interviewModel";
import JobApplication from "../models/jobApplication/jobApplicationModel";
import Job from "../models/jobs/jobModel";
import { handleInterviewNotification } from "../utils/interviewNotifications";

// Controller function to add an interview
export const addInterview = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const {
      applicationId,
      jury,
      interviewDate,
      interviewTime,
      status = "Pending",
    } = req.body;

    const application = await JobApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Job application not found" });
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    function randomID(len: number) {
      let result = "";
      if (result) return result;
      const chars =
          "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
        maxPos = chars.length;
      len = len || 5;
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * maxPos));
      }
      return result;
    }

    const intervieweeId = application.applicantId;
    const jobId = application.jobId;
    const interviewerId = job.userId;
    const interviewLink = randomID(10);

    const newInterview = new Interview({
      interviewerId,
      intervieweeId,
      applicationId,
      jobId,
      jury: [...jury],
      interviewDate,
      interviewTime,
      interviewLink,
      status,
    });

    const savedInterview = await newInterview.save();

    await JobApplication.findByIdAndUpdate(applicationId, {
      isInterviewScheduled: true,
    });

    const jobs = await Job.find({ userId: interviewerId });

    const jobIds = jobs.map((job) => job._id);
    const applications = await JobApplication.find({ jobId: { $in: jobIds } })
      .populate("applicantId")
      .populate("jobId")
      .exec();

    res.status(201).json({
      message: "Interview scheduled successfully",
      interview: savedInterview,
      applications: applications,
    });
    await handleInterviewNotification(savedInterview, false);
  } catch (error) {
    console.error("Error adding interview:", error);
    res.status(500).json({ message: "Error adding interview" });
  }
};

// Controller function to edit an interview
export const editInterview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.body;
    const { jury, interviewDate, interviewTime, status } = req.body;

    const existingInterview = await Interview.findById(id);
    if (!existingInterview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    existingInterview.jury = jury;
    existingInterview.interviewDate = interviewDate;
    existingInterview.interviewTime = interviewTime;
    existingInterview.status = status || existingInterview.status;

    const updatedInterview = await existingInterview.save();

    res.status(200).json({
      message: "Interview updated successfully",
      interview: updatedInterview,
    });
    await handleInterviewNotification(updatedInterview, false);
  } catch (error) {
    console.error("Error editing interview:", error);
    res.status(500).json({ message: "Error editing interview" });
  }
};

// Controller function to change the status of an interview
export const setInterviewStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, interviewId } = req.body;

    const existingInterview = await Interview.findById(interviewId);
    if (!existingInterview) {
      res.status(404).json({ message: "Interview not found" });
      return;
    }

    existingInterview.status = status;

    const updatedInterview = await existingInterview.save();

    res.status(200).json({
      message: "Interview status updated successfully",
      interview: updatedInterview,
    });
  } catch (error) {
    console.error("Error changing interview status:", error);
    res.status(500).json({ message: "Error changing interview status" });
  }
};

export const getInterviewsByInterviewerId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const interviewerId = req.body.interviewerId;

    const interviews = await Interview.find({ interviewerId: interviewerId })
      .populate("interviewerId")
      .populate("intervieweeId")
      .populate("jobId");

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

export const getInterviewsByIntervieweeId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const intervieweeId = req.body.intervieweeId;
    console.log(intervieweeId);

    const interviews = await Interview.find({ intervieweeId: intervieweeId })
      .populate("interviewerId")
      .populate("intervieweeId")
      .populate("jobId");

    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};

export const getInterviewsByJobId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const jobId = req.body.jobId;

    const interviews = await Interview.find({ jobId })
      .populate("interviewerId")
      .populate("intervieweeId")
      .populate("jobId");
    res.status(200).json({ interviews });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({ message: "Error fetching interviews" });
  }
};
