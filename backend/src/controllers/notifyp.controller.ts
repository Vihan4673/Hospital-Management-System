import { Request, Response, NextFunction } from 'express';
import { AppointmentModel } from '../models/Appointment';
import { sendEmail } from '../utils/mailer';
import { APIError } from '../errors/APIError';
import { Patient } from '../models/Patient';
import { DoctorModel } from '../models/DoctorModel';

export const notifyOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();

        const overdueLendings = await AppointmentModel.find({
            dueDate: { $lt: today },
            returned: false,
        }).populate('reader').populate('book');

        const grouped: Record<string, { reader: any; books: any[] }> = {};

        overdueLendings.forEach((lending: any) => {
            const reader = lending.reader as any;
            const book = lending.book as any;

            if (!reader) return;

            const patientId = reader._id || reader.patientId;

            if (!grouped[patientId]) {
                grouped[patientId] = { reader, books: [] };
            }

            grouped[patientId].books.push({
                title: book?.name || book?.title || 'Appointment/Doctor',
                dueDate: lending.dueDate ? new Date(lending.dueDate).toDateString() : today.toDateString(),
            });
        });

        for (const patientId in grouped) {
            const { reader, books } = grouped[patientId];

            if (!reader || !reader.email) continue;

            const bookList = books
                .map(book => `
                    <li>
                        <strong>${book.title}</strong> 
                        — <span style="color: red;">Due Date: ${new Date(book.dueDate).toLocaleDateString()}</span>
                    </li>
                `)
                .join('');

            const message = `
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
                <p><strong>Dear ${reader.name || 'Patient'},</strong></p>

                <p>This is a reminder that you have an overdue or pending schedule/appointment detail:</p>
                
                <ul style="padding-left: 20px;">
                    ${bookList}
                </ul>

                <p>Please attend or contact the hospital management as soon as possible.</p>

                <p>Thank you,<br/> Hospital Management System</p>
                </div>
            `;

            await sendEmail(reader.email, '⚠️ Overdue Notification', message);
        }

        res.status(200).json({ message: 'Email notifications sent successfully.' });
    } catch (error: any) {
        next(new APIError(500, "Failed to send notifications", error.message));
    }
};

export const testmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await sendEmail('sherul.dhanushka@gmail.com', 'Hospital Management', 'This is a test mail from Hospital Management System 🏥');
        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error: any) {
        next(new APIError(500, "Failed to send test email", error.message));
    }
};