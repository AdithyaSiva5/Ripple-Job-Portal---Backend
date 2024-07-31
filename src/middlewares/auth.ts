import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Response, NextFunction } from "express";
import User from "../models/user/userModel";
import { RequestWithToken } from "./RequestWithToken";

interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

const protect = asyncHandler(
  async (req: RequestWithToken, res: Response, next: NextFunction) => {

    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1].trim();
        
   


        if (!token) {
          res.status(401);
          throw new Error("Not authorized, no token provided");
        }



        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        ) as DecodedToken;

 

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
          res.status(401);
          throw new Error("User not found");
        }

        if (user.isBlocked) {
          res.status(403);
          throw new Error("Your account is temporarily suspended");
        }

        req.user = user;
        req.token = token;
        next();
      } catch (error: any) {
        console.error("Token verification error:", error);
        if (error.name === "TokenExpiredError") {
          res.status(401);
          throw new Error("Token expired");
        } else if (error.name === "JsonWebTokenError") {
          res.status(401);
          throw new Error("Invalid token");
        } else {
          res.status(401);
          throw new Error(error.message || "Not authorized");
        }
      }
    } else {
    
      res.status(401);
      throw new Error("Not authorized, no token provided");
    }
  }
);

export { protect };