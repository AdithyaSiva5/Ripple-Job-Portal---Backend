import mongoose from "mongoose";
const connectDB = async (): Promise<void> =>{
    try {
        const mongoURI : any = process.env.MONGO_URL
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

    } catch (error) {
        console.error(error)
        process.exit(1)
        
    }
}

export default connectDB;