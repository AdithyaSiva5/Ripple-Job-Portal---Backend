import { JwtPayload } from 'jsonwebtoken';
import { Request } from "express";


export interface RequestWithToken extends Request {
  token?: string;
  user?: any;
}