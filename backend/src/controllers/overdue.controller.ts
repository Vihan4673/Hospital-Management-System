import { Request, Response, NextFunction } from "express";
// 1. Appointment මොඩල් එක සාමාන්‍යයෙන් export කරන්නේ AppointmentModel හෝ Appointment කියලා.
// ඔයාගේ Appointment.ts එකේ තියෙන නිවැරදි නම මෙතනට දාන්න. (මම මෙතනට AppointmentModel කියලා දැම්මා)
import { AppointmentModel } from "../models/Appointment";
import { APIError } from "../errors/APIError";
import { Patient } from "../models/Patient";

export const getOverdueReaders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    console.log(`today ${today}`);

    // 2. මෙතන 'LendingModel' වෙනුවට 'AppointmentModel' (හෝ ඔයාගේ නිවැරදි මොඩල් එක) යොදාගත්තා.
    // Hospital එකක නම් 'overdue' වෙන්නේ පරණ වෙච්ච, හැබැයි තවම status එක complete නොවෙච්ච appointments වෙන්න ඇති.
    const overdueAppointments = await AppointmentModel.find({
      dueDate: { $lt: today },
      status: { $ne: "Completed" }, // උදාහරණයක් ලෙස: තවම complete නොවුණු ඒවා (returned වෙනුවට)
    })
        .populate("doctor")   // 'book' වෙනුවට Hospital එකකට ගැලපෙන දේ (උදා: doctor හෝ treatment)
        .populate("patient"); // 'reader' වෙනුවට Hospital එකේ ඉන්නේ patient (රෝගියා)

    console.log(`Overdue appointments count: ${overdueAppointments.length}`);

    if (overdueAppointments.length === 0) {
      return res.status(200).json({ message: "No overdue appointments found." });
    }

    // රෝගියා (Patient) අනුව ගෲප් කිරීමට Object එකක් සෑදීම
    const overdueByPatient: Record<string, any> = {};

    // 3. (appointment: any) ලෙස දමා පළමු Error එක මඟහරවා ගත්තා.
    overdueAppointments.forEach((appointment: any) => {

      // 'reader' වෙනුවට 'patient' ලෙස වෙනස් කරන ලදී
      const patient = appointment.patient as unknown as Patient;

      // 4. Patient මොඩල් එකේ 'readerId' කියා එකක් නැත. ඒ වෙනුවට බොහෝවිට ඇත්තේ '_id' හෝ 'patientId' ය.
      // මෙතන '_id' ලෙස නිවැරදි කර ඇත.
      const patientId = (patient as any)._id || (patient as any).patientId;

      if (!patientId) return; // රෝගියෙක් නැත්නම් loop එක skip කරයි

      if (!overdueByPatient[patientId]) {
        overdueByPatient[patientId] = {
          patient: appointment.patient,
          overdueAppointments: [],
        };
      }

      overdueByPatient[patientId].overdueAppointments.push({
        doctor: appointment.doctor, // 'book' වෙනුවට
        dueDate: appointment.dueDate,
        appointmentDate: appointment.appointmentDate, // 'lentDate' වෙනුවට
      });
    });

    res.status(200).json(Object.values(overdueByPatient));
  } catch (err: any) {
    next(new APIError(500, "Failed to fetch overdue data", err.message));
  }
};