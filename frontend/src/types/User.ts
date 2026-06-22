export interface User {
  _id?: string;
  name: string;
  password?: string;
  role: "patient" | "doctor" | "admin"; // ⚡ FIX: "doctor" එකතු කරන ලදී

  // ⚡ FIX: Fields දෙකම optional (?) කරන ලදී (Doctor ට email නැති නිසා සහ Patient ට doctorId නැති නිසා)
  email?: string;
  doctorId?: string;
}