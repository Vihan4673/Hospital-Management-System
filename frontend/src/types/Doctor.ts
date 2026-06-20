export type Doctor = {
    _id: string;                    // Database එකෙන් එන ප්‍රධාන Unique ID එක (Required)
    doctorId: string;              // ඔබ පවත්වාගෙන යන Custom Doctor ID එක (e.g., DOC001)
    name: string;
    email: string;
    phone: string;
    specialty: string;             // විශේෂඥතාව (e.g., Cardiologist)
    channellingPrice: number;      // චැනලින් ගාස්තුව
    availableDays: string[];       // පැමිණෙන දවස් (e.g., ["Monday", "Wednesday"])

    // 💡 1. වෙලාවන් (Time Slots) සඳහා අලුතින් එක් කළ Fields
    startTime: string;             // පැමිණෙන වෙලාව (e.g., "08:30")
    endTime: string;               // පිටවන වෙලාව (e.g., "11:30")

    createdAt: string | Date;      // නිර්මාණය වූ දිනය
    updatedAt: string | Date;      // යාවත්කාලීන වූ දිනය
};