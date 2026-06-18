import { NextFunction, Request, Response } from 'express';
import { ReaderModel, } from '../models/Reader';
import mongoose from 'mongoose';
import { APIError } from '../errors/APIError';

const generateReaderId = async (): Promise<string> => {
  const lastReader = await ReaderModel.findOne().sort({ createdAt: -1 }).exec();

  if (!lastReader || !lastReader.readerId) {
    return 'RE001';
  }

  const lastIdNumber = parseInt(lastReader.readerId.substring(2)); // Remove 'RE'
  const newIdNumber = lastIdNumber + 1;
  const padded = String(newIdNumber).padStart(3, '0');

  return `RE${padded}`;
};

export const createReader = async (req: Request, res: Response, next:NextFunction) =>{
    try {
        
        const readerId = await generateReaderId();
    
        const {name, email, phone, address} = req.body;
        const newReader = new ReaderModel({
            readerId,
            name, 
            email,
            phone,
            address,
            isActive: true,
        })
    
        const savedReader = await newReader.save();
    
        return res.status(201).json(savedReader)
    } catch (error: any) {
          if (error instanceof mongoose.Error.ValidationError) {
            const errors = Object.values(error.errors).map((e)=> e.message)
            return next(new APIError(400, "Validation failed", errors))
          }
        next(new APIError(500, "Internal server Error", error.message ))
    }
}

export const getReaderById  = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
      const reader = await ReaderModel.findOne({readerId:req.params.id})
      if (!reader) {
          throw new APIError(404, "Reader not found")
      }
      res.status(200).json(reader)
  } catch (error:any) {
      next(new APIError(500,"Internal server Error", error.message))
  }
}


export const getAllReaders = async(
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reader = await ReaderModel.find()
    res.status(201).json(reader)
  } catch (error: any) {
    next(new APIError(500,"Internal server Error", error.message))
  }
  
}


export const updateReader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updated = await ReaderModel.findOneAndUpdate(
      { readerId: req.params.id},
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return next(new APIError(404, "Reader not found"));
    res.status(201).json(updated);
  } catch (err: any) {
    if (err instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(err.errors).map(e => e.message);
      next(new APIError(400, "Validation failed", errors));
    } else {
      next(new APIError(500, "Internal Server Error", err.message));
    }
  }
};

export const deleteReader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await ReaderModel.findOneAndDelete({ readerId: req.params.id });
    if (!deleted) return next(new APIError(404, "Reader not found"));
    res.send("Reader deleted");
  } catch (err: any) {
    next(new APIError(500, "Internal Server Error", err.message));
  }
};

