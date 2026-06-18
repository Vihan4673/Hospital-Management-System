import express from 'express';
import { notifyOverdueReaders, testmail } from '../controllers/notifyp.controller';

const notifyRouter = express.Router();

notifyRouter.post('/overdue', notifyOverdueReaders);
notifyRouter.post('/test', testmail)

export default notifyRouter;