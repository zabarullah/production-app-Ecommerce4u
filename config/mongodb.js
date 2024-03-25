import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

export default connectMongoDB;
