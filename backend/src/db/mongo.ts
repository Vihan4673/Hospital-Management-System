
import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL || "")
    console.log("MongoDB connected")
  } catch (err) {
    console.error("Failed to connect to MongoDB", err)
    process.exit(1)
  }
}
