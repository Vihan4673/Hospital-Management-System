
import mongoose, { Schema } from "mongoose";
import { Book } from "./Book";
import { Reader } from "./Reader";

export type Lending = {
  book: mongoose.Schema.Types.ObjectId | Book ;
  reader: mongoose.Schema.Types.ObjectId | Reader;
  lentDate: Date;
  dueDate: Date;
  returned: boolean;
}

const LendingSchema = new mongoose.Schema<Lending>(
  {
    book: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    reader: { type: Schema.Types.ObjectId, ref: "Reader", required: true },
    lentDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const LendingModel = mongoose.model<Lending>("Lending", LendingSchema);
