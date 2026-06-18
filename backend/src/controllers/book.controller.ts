import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BookModel } from '../models/Book';
import { APIError } from '../errors/APIError';

// Create a new book
export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author, genre, publishedYear, isbn, copies } = req.body;

    const existingBook = await BookModel.findOne({ isbn });
    if (existingBook) {
      return next(new APIError(400, 'Book with this ISBN already exists'));
    }

    const newBook = new BookModel({
      title,
      author,
      genre,
      publishedYear,
      isbn,
      copies,
      available: copies,
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      next(new APIError(400, 'Validation failed', errors));
    } else {
      next(new APIError(500, 'Internal Server Error', err.message));
    }
  }
};

// @desc Get all books
export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await BookModel.find();
    res.status(200).json(books);
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};

// @desc Get book by Mongo _id
export const getBookByIsbn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await BookModel.findOne({ isbn: req.params.isbn });
    if (!book) return next(new APIError(404, 'Book not found'));
    res.status(200).json(book);
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};

// @desc Update book by _id
export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updatedBook = await BookModel.findOneAndUpdate(
      { isbn: req.params.isbn },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBook) return next(new APIError(404, 'Book not found'));
    res.status(200).json(updatedBook);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      next(new APIError(400, 'Validation failed', errors));
    } else {
      next(new APIError(500, 'Internal Server Error', err.message));
    }
  }
};

// @desc Delete book by _id
export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedBook = await BookModel.findOneAndDelete({ isbn: req.params.isbn });
    if (!deletedBook) return next(new APIError(404, 'Book not found'));

    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (err: any) {
    next(new APIError(500, 'Internal Server Error', err.message));
  }
};
