import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // await mongoose.connect(process.env.MONGO_URI!);

    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("Environment variable MONGO_URI is not defined.");
    }

    await mongoose.connect(mongoUri);

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("MongoDB connection established");
    });

    connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
      process.exit();
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
