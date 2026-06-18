export interface Doctor {
  _id?: string;              // Backend database (MongoDB) identifier
  doctorId: string;          // Unique Doctor ID / Registration Number (Ex: DOC1042)
  name: string;              // Doctor's Full Name (Ex: Dr. John Doe)
  specialization: string;    // Area of expertise (Ex: Cardiologist, Pediatrician)
  phone: string;             // Contact number
  email: string;             // Email address
  consultationFee: number;   // Channeling fee (LKR)
  availableDays: string[];   // Days the doctor is available (Ex: ["Monday", "Wednesday"])
  createdAt?: Date;          // Auto-generated timestamp
  updatedAt?: Date;          // Auto-generated timestamp
}