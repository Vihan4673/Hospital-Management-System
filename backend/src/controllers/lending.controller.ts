// controllers/lending.controller.ts
import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/lending";
import mongoose from "mongoose";
import { APIError } from "../errors/APIError";
import { BookModel } from '../models/Book';

//lend book
// export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { book, reader } = req.body;

//     // 1. Find book by ISBN
//     const foundBook = await BookModel.findOne({ isbn: book }).session(session);
//     if (!foundBook) {
//       await session.abortTransaction();
//       return next(new APIError(404, "Book not found"));
//     }

//     // 2. Check copies
//     if (foundBook.copies <= 0) {
//       await session.abortTransaction();
//       return next(new APIError(400, "No available copies to lend"));
//     }

//     // 3. Reduce copies
//     foundBook.copies -= 1;
//     await foundBook.save({ session });

//     // 4. Create lending entry
//     const lentDate = new Date();
//     const dueDate = new Date(lentDate);
//     dueDate.setDate(dueDate.getDate() + 14);

//     const lending = new LendingModel({
//       book: foundBook._id ,   //: foundBook._id
//       reader,
//       lentDate,
//       dueDate,
//     });

//     const savedLending = await lending.save({ session });

//     // 5. Commit transaction
//     await session.commitTransaction();
//     res.status(201).json(savedLending);
//   } catch (err: any) {
//     await session.abortTransaction();
//     next(new APIError(500, "Error lending book", err.message));
//   } finally {
//     session.endSession();
//   }
// };

export const lendBook = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { book, reader, dueDate } = req.body; // dueDate is optional

    //Find book by ISBN
    const foundBook = await BookModel.findOne({ isbn: book }).session(session);
    if (!foundBook) {
      await session.abortTransaction();
      return next(new APIError(404, "Book not found"));
    }

    //Check copies
    if (foundBook.copies <= 0) {
      await session.abortTransaction();
      return next(new APIError(400, "No available copies to lend"));
    }

    //Decrease copies
    foundBook.copies -= 1;
    await foundBook.save({ session });

    //Create lending entry
    const lentDate = new Date();

    //dueDate handling, default - 14 days
    const finalDueDate = dueDate ? new Date(dueDate) : new Date(lentDate);
    if (!dueDate) {
      finalDueDate.setDate(finalDueDate.getDate() + 14);
    }

    const lending = new LendingModel({
      book: foundBook._id,
      reader,
      lentDate,
      dueDate: finalDueDate,
    });

    const savedLending = await lending.save({ session });

    //Commit transaction
    await session.commitTransaction();
    res.status(201).json(savedLending);
  } catch (err: any) {
    await session.abortTransaction();
    next(new APIError(500, "Error lending book", err.message));
  } finally {
    session.endSession();
  }
};



//return book
export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;

    // 1. Find the lending record
    const lending = await LendingModel.findById(id).session(session);
    if (!lending) {
      await session.abortTransaction();
      return next(new APIError(404, "Lending record not found"));
    }

    // 2. Check if already returned
    if (lending.returned) {
      await session.abortTransaction();
      return next(new APIError(400, "Book has already been returned"));
    }

    // 3. Mark as returned
    lending.returned = true;
    await lending.save({ session });

    // 4. Increment book's available copies
    const book = await BookModel.findById(lending.book).session(session);
    if (!book) {
      await session.abortTransaction();
      return next(new APIError(404, "Associated book not found"));
    }

    book.copies += 1;
    await book.save({ session });

    // 5. Commit transaction
    await session.commitTransaction();

    res.status(200).json({ message: "Book returned successfully", lending });
  } catch (err: any) {
    await session.abortTransaction();
    next(new APIError(500, "Error returning book", err.message));
  } finally {
    session.endSession();
  }
};

//all active lending
export const getActiveLendings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const active = await LendingModel.find({ returned: false }).populate("book reader");
    res.status(200).json(active);
  } catch (err: any) {
    next(new APIError(500, "Error fetching lendings", err.message));
  }
};


//lending history by book
export const getLendingHistoryByBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookId } = req.params;
    const history = await LendingModel.find({ book: bookId }).populate("reader");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching history", err.message));
  }
};

//lending history by reader
export const getLendingHistoryByReader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { readerId } = req.params;
    const history = await LendingModel.find({ reader: readerId }).populate("book");
    res.status(200).json(history);
  } catch (err: any) {
    next(new APIError(500, "Error fetching history", err.message));
  }
};



