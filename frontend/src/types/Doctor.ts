export type Doctor = {
    _id?: string;
    doctorId?: string;
    name: string;
    email: string;
    phone: string;
    specialty: string;
    roomNumber: string;
    isActive: boolean;

    channellingPrice?: number;
    channelingPrice?: number;

    availableDays: string[];
    startTime: string;
    endTime: string;

    createdAt?: string | Date;
    updatedAt?: string | Date;
};