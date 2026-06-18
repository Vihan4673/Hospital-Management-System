import mongoose, { Schema, Document } from "mongoose";

export type Book = {
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  isbn: string;
  copies: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema<Book>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    publishedYear: {
      type: Number,
      required: true,
    },
    isbn: {
      type: String,
      unique: true,
    },
    copies: {
      type: Number,
      required: true,
      min: 0,
    },
    available: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const BookModel = mongoose.model<Book>("Book", BookSchema);
