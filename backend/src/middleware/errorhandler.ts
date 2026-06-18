// middleware/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { APIError } from "../errors/APIError";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof APIError) {
    res.status(err.status).json({
      message: err.message,
      errors: err.errors,
    });
  } else {
    res.status(500).json({ message: "Internal Server Error", errors: err.errors, });
  }
}
