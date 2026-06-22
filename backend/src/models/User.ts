import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    index: { unique: true, sparse: true },
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
  },
  doctorId: {
    type: String,
    trim: true,
    uppercase: true,
    index: { unique: true, sparse: true },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  role: {
    type: String,
    enum: ["patient", "doctor", "admin"],
    default: "patient"
  }
}, {
  timestamps: true
})

const UserModel = mongoose.model("User", userSchema)

export { UserModel }