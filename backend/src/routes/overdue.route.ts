import { Router } from "express";
import { getOverdueReaders } from "../controllers/OverdueApomentController";


const overdueRouter = Router();

overdueRouter.get("/", getOverdueReaders);

export default overdueRouter;