import { Router } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import { createBook, deleteBook, getAllBooks, getBookByIsbn, updateBook } from "../controllers/book.controller";

const bookRouter = Router()

bookRouter.use(authenticateToken)
bookRouter.get("/", getAllBooks)
bookRouter.get("/:isbn", getBookByIsbn)
bookRouter.post("/",createBook)
bookRouter.put("/:isbn",updateBook)
bookRouter.delete("/:isbn",deleteBook)



export default bookRouter