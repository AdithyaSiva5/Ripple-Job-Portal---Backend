import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";



export const getConnection = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    const connection =await Connections.findOne({ userId }).populate({
      path: 'connections',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requested',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requestSent',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    });


    res.status(200).json({ connection: connection });
    
  }
);



export const getFollowRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
  

    const requests = await Connections.findOne({ userId }).populate({
      path: "requested",
      select: "username profileImageUrl",
    });
   
    res.status(200).json({ requests: requests?.requested });
  }
);




export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId, followingUser } = req.body;
  console.log(userId,followingUser);
  
  const followingUserInfo = await User.findById(followingUser);
  let followed = false;
  if (!followingUserInfo) {
    res.status(400);
    throw new Error("User not found");
  }

  
    await Connections.findOneAndUpdate(
      { userId: followingUser },
      { $addToSet: { requested: userId } },
      { upsert: true }
    );
    await Connections.findOneAndUpdate(
      { userId },
      { $addToSet: { requestSent: followingUser } },
      { upsert: true }
    );
 
  const followingUserConnections = await Connections.find({
    userId: followingUser,
  });

  res
    .status(200)
    .json({ success: true, message: "User followed successfully", followed });
});




export const unFollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, unfollowingUser } = req.body;

    await Connections.findOneAndUpdate(
      { userId: unfollowingUser },
      { $pull: { connections: userId, requestSent: userId } }
    );

    await Connections.findOneAndUpdate(
      { userId },
      { $pull: { connections: unfollowingUser, requested: unfollowingUser } }
    );

    const connection =await Connections.findOne({ userId }).populate({
      path: 'connections',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requested',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requestSent',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    });


    res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully" ,connection: connection });
  }
);


export const rejectRequest= asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    await Connections.findOneAndUpdate(
      { userId },
      {
        $pull: { requested: requestedUser },
       
      },
      { new: true }
    );
    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      {
        $pull: { requestSent: userId },
      
      },
      { new: true }
    );
    const connection =await Connections.findOne({ userId }).populate({
      path: 'connections',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requested',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requestSent',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    });

          res
      .status(200)
      .json({ success: true, message: "Follow request rejected successfully", connection: connection });
  }
);


export const  acceptRequest  = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    await Connections.findOneAndUpdate(
      { userId },
      {
        $pull: { requested: requestedUser },
        $addToSet: { connections: requestedUser },
      },
      { new: true }
    );
    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      {
        $pull: { requestSent: userId },
        $addToSet: { connections: userId },
      },
      { new: true }
    );
    const connection =await Connections.findOne({ userId }).populate({
      path: 'connections',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requested',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    })
    .populate({
      path: 'requestSent',
      select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
    });

          res
      .status(200)
      .json({ success: true, message: "Follow request accepted successfully", connection: connection });
  }
);


export const cancelFollowRequest = asyncHandler(async (req: Request, res: Response) => {
  const { userId, cancelingUser } = req.body;

  await Connections.findOneAndUpdate(
    { userId },
    { $pull: { requestSent: cancelingUser } }
  );

  await Connections.findOneAndUpdate(
    { userId: cancelingUser },
    { $pull: { requested: userId } }
  );

  const connection =await Connections.findOne({ userId }).populate({
    path: 'connections',
    select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
  })
  .populate({
    path: 'requested',
    select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
  })
  .populate({
    path: 'requestSent',
    select: 'profile.fullname profile.location  companyProfile.companyName companyProfile.companyType companyProfile.companyLocation profile.designation profileImageUrl',
  });


  res.status(200).json({ success: true, message: "Follow request canceled successfully", connection: connection });
});