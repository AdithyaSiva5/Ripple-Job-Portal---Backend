import {Schema, model } from "mongoose";
import PremiumInterface from "./premiumTypes";

const PremiumSchema = new Schema<PremiumInterface>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: String,
        required: true
    },
    transactionId:{
        type: String,
        required: true
    },
   
    startDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        default: Date.now
    },
});

const PremiumUsers = model<PremiumInterface>('PremiumUsers', PremiumSchema);

export default PremiumUsers;