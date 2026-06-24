import { AppointmentModel } from "../models/Appointment";

export const getOverdueAppointmentsService = async (today: Date) => {
    return await AppointmentModel.find({
        dueDate: { $lt: today },
        status: { $ne: "Completed" },
    })
        .populate("doctor")
        .populate("patient");
};