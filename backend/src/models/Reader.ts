import e from "express";
import mongoose from "mongoose";

export type Reader = {
  readerId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const readerSchema = new mongoose.Schema<Reader>({
  readerId: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  phone: { type: String },
  address: { type: String },
  isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ReaderModel = mongoose.model('Reader', readerSchema);
