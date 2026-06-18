import { Router } from "express";
import { createReader, deleteReader, getAllReaders, getReaderById, updateReader } from "../controllers/reader.controller";
import { authenticateToken } from "../middleware/authenticateToken";

const readerRouter = Router()

readerRouter.use(authenticateToken)
readerRouter.get("/", getAllReaders)
readerRouter.get("/:id", getReaderById)
readerRouter.post("/",createReader)
readerRouter.put("/:id",updateReader)
readerRouter.delete("/:id",deleteReader)



export default readerRouter