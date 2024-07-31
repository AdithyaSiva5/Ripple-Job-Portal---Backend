import jwt from "jsonwebtoken";

const generateRefreshToken = (id: string): string => {
  return jwt.sign({id}, process.env.JWT_SECRET as string, {
    expiresIn: "60d",
  });
};

export default generateRefreshToken;
