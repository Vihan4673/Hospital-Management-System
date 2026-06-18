import { Router } from "express";
import { getOverdueReaders } from "../controllers/overdue.controller";


const overdueRouter = Router();

overdueRouter.get("/", getOverdueReaders);

export default overdueRouter;