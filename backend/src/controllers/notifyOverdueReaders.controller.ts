import { Request, Response, NextFunction } from 'express';
import { LendingModel } from '../models/lending';
import { sendEmail } from '../utils/mailer';
import { APIError } from '../errors/APIError';
import { Reader } from '../models/Reader';
import { Book } from '../models/Book';

export const notifyOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();

        const overdueLendings = await LendingModel.find({
            dueDate: { $lt: today },
            returned: false,
        }).populate('reader').populate('book');

        const grouped: Record<string, { reader: any; books: any[] }> = {};

        overdueLendings.forEach(lending => {
            const reader = lending.reader as Reader;
            const book = lending.book as Book;

            if (!grouped[reader.readerId]) {
                grouped[reader.readerId] = { reader, books: [] };
            }
            grouped[reader.readerId].books.push({
                title: book.title,
                dueDate: lending.dueDate.toDateString(),
            });
        });

        // Send emails
        for (const readerId in grouped) {
            const { reader, books } = grouped[readerId];

            const bookList = books
                .map(book => `
                    <li>
                        <strong>${book.title}</strong> 
                        — <span style="color: red;">Due: ${new Date(book.dueDate).toLocaleDateString()}</span>
                    </li>
                    `)
                                .join('');

                            const message = `
                    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                    <p><strong>Dear ${reader.name},</strong></p>

                    <p>You have the following overdue books:</p>
                    
                    <ul style="padding-left: 20px;">
                        ${bookList}
                    </ul>

                    <p>Please return them as soon as possible to avoid penalties.</p>

                    <p>Thank you,<br/> BOOK CLUB Library Management System</p>
                    </div>
                `;

            await sendEmail(reader.email, '📚 Overdue Book Notification', message);
        }

        res.status(200).json({ message: 'Email notifications sent successfully.' });
    } catch (error: any) {
        next(new APIError(500, "Failed to send notifications", error.message));
    }
};

export const testmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await sendEmail('sherul.dhanushka@gmail.com', 'Bookclub', 'This is a test mail from Book Club Library System 📚');
        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error: any) {
        next(new APIError(500, "Failed to send test email", error.message));
    }
};
