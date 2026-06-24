export interface User {
  _id?: string;
  name: string;
  password?: string;
  role: "patient" | "doctor" | "admin";
  email?: string;
  doctorId?: string;
}