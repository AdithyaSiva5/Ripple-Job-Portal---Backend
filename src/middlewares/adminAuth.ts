import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import Admin from "../models/admin/adminModel";

interface JwtPayload {
  id: string;
  role: string;  
}

interface RequestWithAdmin extends Request {
  admin?: any;
}

const protectAdmin = asyncHandler(
  async (req: RequestWithAdmin, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401);
      return next(new Error("Not authorized, no token"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

      if (decoded.role !== 'admin') {
        res.status(403);
        return next(new Error("Not authorized, admin access required"));
      }

      const admin = await Admin.findById(decoded.id).select("-password");

      if (!admin) {
        res.status(401);
        return next(new Error("Not authorized, admin not found"));
      }

      req.admin = admin;
      next();
    } catch (error) {
      console.error("JWT verification error:", error);
      res.status(401);
      next(new Error("Not authorized, invalid token"));
    }
  }
);

export { protectAdmin };