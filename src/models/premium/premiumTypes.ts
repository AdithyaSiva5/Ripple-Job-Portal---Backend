import { Document, Types } from "mongoose";

interface PremiumInterface extends Document {
    userId: Types.ObjectId;
    transactionId: string;
    startDate: Date;
    expiryDate: Date;
    amount:string;  
}

export default PremiumInterface;