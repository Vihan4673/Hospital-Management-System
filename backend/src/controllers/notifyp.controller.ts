import { Request, Response, NextFunction } from 'express';
import { AppointmentModel } from '../models/Appointment';
import { sendEmail } from '../utils/sendEmail';
import { APIError } from '../errors/APIError';

// 1️⃣ NOTIFY PATIENTS ABOUT MISSED / PENDING APPOINTMENTS (With Token Support)
export const notifyOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const today = new Date();

        // status එක 'pending' වෙලා, හැබැයි appointment date එක අදට වඩා පරණ වෙච්ච ඒවා සෙවීම
        const missedAppointments = await AppointmentModel.find({
            appointmentDate: { $lt: today },
            status: "pending"
        }).populate('patient').populate('doctor').lean();

        // එකම patient ට appointments කිහිපයක් තිබුණොත් group කර ගැනීමට
        const grouped: Record<string, { patient: any; appointments: any[] }> = {};

        missedAppointments.forEach((app: any) => {
            const patient = app.patient;
            const doctor = app.doctor;

            if (!patient) return;

            const patientId = patient._id.toString();

            if (!grouped[patientId]) {
                grouped[patientId] = { patient, appointments: [] };
            }

            grouped[patientId].appointments.push({
                doctorName: doctor?.name ? `Dr. ${doctor.name}` : 'General Doctor',
                date: app.appointmentDate ? new Date(app.appointmentDate).toLocaleString() : today.toLocaleString(),
                room: app.roomNumber || 'Room A',
                tokenNumber: app.tokenNumber || 'N/A' // ⚡ FIX: Token Number එකත් group එකට එකතු කරගත්තා
            });
        });

        // හැම රෝගියෙකුටම (Patient) වෙන වෙනම email එක බැගින් යැවීම
        for (const patientId in grouped) {
            const { patient, appointments } = grouped[patientId];

            if (!patient || !patient.email) continue;

            // ⚡ FIX: Email එක ඇතුළේ Token Number එක [Token #X] විදිහට ලස්සනට පෙන්වීම
            const appointmentList = appointments
                .map(app => `
                    <li style="margin-bottom: 12px; line-height: 1.5;">
                        <span style="background-color: #ffebee; color: #c62828; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-right: 5px;">Token #${app.tokenNumber}</span>
                        <strong>${app.doctorName}</strong> 
                        — <span style="color: #d32f2f;">Scheduled Date: ${app.date} (${app.room})</span>
                    </li>
                `)
                .join('');

            const message = `
                <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #d32f2f; margin-top: 0; border-bottom: 2px solid #d32f2f; padding-bottom: 8px;">⚠️ Missed/Pending Appointment Notification</h2>
                    <p>Dear <strong>${patient.name || 'Patient'}</strong>,</p>
                    <p>This is a reminder from hospital management that you have missed or have a pending schedule with the following doctor(s):</p>
                    
                    <ul style="padding-left: 10px; background-color: #fdf2f2; padding: 15px; border-radius: 5px; list-style-type: none;">
                        ${appointmentList}
                    </ul>

                    <p>Please contact the hospital reception or management system to reschedule your appointment as soon as possible.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
                    <p style="font-size: 12px; color: #777;">Thank you,<br/><strong>Hospital Management System</strong></p>
                </div>
            `;

            sendEmail({
                to: patient.email,
                subject: '⚠️ Missed Appointment Alert',
                text: `Dear ${patient.name || 'Patient'}, you have missed or pending appointments. Please contact hospital management.`,
                html: message
            }).catch(err => console.error(`❌ Missed app email failed for ${patient.email}:`, err));
        }

        res.status(200).json({ message: 'Missed appointment email notifications processed successfully.' });
    } catch (error: any) {
        console.error("🔥 NOTIFY OVERDUE ERROR:", error);
        next(new APIError(500, "Failed to send notifications", error.message));
    }
};

// 2️⃣ TEST EMAIL ROUTE
export const testmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        await sendEmail({
            to: email || 'your-test-email@gmail.com',
            subject: '🏥 Hospital Management Test Mail',
            text: 'This is a test mail from Hospital Management System 🏥',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #4CAF50; border-radius: 8px; max-width: 500px;">
                    <h2 style="color: #4CAF50; margin-top: 0;">Success! 🎉</h2>
                    <p>This is a successful test mail from your <strong>Hospital Management System</strong>.</p>
                    <p>Your Nodemailer configuration is working perfectly! 🚀</p>
                </div>
            `
        });

        res.status(200).json({ message: 'Test email sent successfully!' });
    } catch (error: any) {
        console.error("🔥 TEST MAIL ERROR:", error);
        next(new APIError(500, "Failed to send test email", error.message));
    }
};