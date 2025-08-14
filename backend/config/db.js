import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
let isConnected = false;

const connectDB = async () => {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Create a .env file with MONGODB_URI=<connection-string> or set the env var."
    );
  }

  // If already connected, return
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    // Serverless-optimized connection options
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
    };

    await mongoose.connect(uri, options);
    isConnected = true;
    console.log("MongoDB connected");

    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
      isConnected = false;
    });

    db.on("disconnected", () => {
      console.log("MongoDB disconnected");
      isConnected = false;
    });

    return db;
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    isConnected = false;
    throw err;
  }
};

export default connectDB;
