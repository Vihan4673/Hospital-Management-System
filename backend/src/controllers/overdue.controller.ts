import { Request, Response, NextFunction } from "express";
import { LendingModel } from "../models/lending";
import { APIError } from "../errors/APIError";
import { Reader } from "../models/Reader";

export const getOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    console.log(`today ${today}`)

    const overdueLendings = await LendingModel.find({
      dueDate: { $lt: today },
      returned: false,
    })
      .populate("book")  // Replace book ID with full book document
      .populate("reader");
    
    console.log(`hi ${overdueLendings}`)

    if (overdueLendings.length === 0) {
      return res.status(200).json({ message: "No overdue books found." });
    }

    // Group by reader
    const overdueByReader: Record<string, any> = {};

    overdueLendings.forEach((lending) => {

     const reader = lending.reader as Reader; // castig
    const readerId = reader.readerId; // 

      if (!overdueByReader[readerId]) {
        overdueByReader[readerId] = {
          reader: lending.reader,
          overdueBooks: [],
        };
      }

      overdueByReader[readerId].overdueBooks.push({
        book: lending.book,
        dueDate: lending.dueDate,
        lentDate: lending.lentDate,
      });
    });

    res.status(200).json(Object.values(overdueByReader));
  } catch (err: any) {
    next(new APIError(500, "Failed to fetch overdue books", err.message));
  }
};
