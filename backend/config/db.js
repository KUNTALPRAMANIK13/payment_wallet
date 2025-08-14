import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Create a .env file with MONGODB_URI=<connection-string> or set the env var."
    );
  }
  try {
    // mongoose.connect resolves only after a successful initial connection
    await mongoose.connect(uri);
    console.log("MongoDB connected");

    const db = mongoose.connection;
    db.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    return db;
  } catch (err) {
    // Re-throw so callers can handle failure (and avoid starting the server)
    throw err;
  }
};

export default connectDB;
