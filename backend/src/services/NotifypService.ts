import { AppointmentModel } from '../models/Appointment';

export const getMissedAppointmentsService = async (today: Date) => {
    return await AppointmentModel.find({
        appointmentDate: { $lt: today },
        status: "pending"
    }).populate('patient').populate('doctor').lean();
};