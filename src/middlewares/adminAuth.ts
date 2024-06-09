import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import Admin from "../models/admin/adminModel";

interface RequestWithToken extends Request {
  token?: string;
  admin?: any;
}

const protectAdmin = asyncHandler(
  async (req: RequestWithToken, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      try {
        token = req.headers.authorization.split(" ")[1];

        const decoded: any = jwt.verify(
          token,
          process.env.JWT_SECRET as string
        );

        req.admin = await Admin.findById(decoded.id).select("-password");

        next();
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authorized");
      }
    }
    if (!token) {
      res.status(401);
      throw new Error("No token");
    }
  }
);

export { protectAdmin };