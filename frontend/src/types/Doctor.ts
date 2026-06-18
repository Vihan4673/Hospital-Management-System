export type Doctor = {
    _id?: string;
    doctorId: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    channellingPrice: number;
    availableDays: string[];
    createdAt: string | Date;
    updatedAt: string | Date;
}