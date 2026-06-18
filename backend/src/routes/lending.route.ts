import { Router } from "express";
import {
  lendBook,
  returnBook,
  getActiveLendings,
  getLendingHistoryByBook,
  getLendingHistoryByReader,
} from "../controllers/lending.controller";

const lendingRouter = Router();

lendingRouter.post("/", lendBook);
lendingRouter.put("/return/:id", returnBook);
lendingRouter.get("/active", getActiveLendings);
lendingRouter.get("/history/book/:bookId", getLendingHistoryByBook);
lendingRouter.get("/history/reader/:readerId", getLendingHistoryByReader);

export default lendingRouter;