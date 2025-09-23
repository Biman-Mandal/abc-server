import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/abcDB";

const mongoDb = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MONGO DB CONNECTED");
  } catch (error) {
    console.error("MONGO DB CONNECTION FAILED");
    console.error(error);
    process.exit(1);
  }
};

export default mongoDb;
