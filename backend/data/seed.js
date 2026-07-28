/**
 * Seeds the database with the doctors already shown on doctor.html
 * and creates a default admin user (credentials from .env).
 * Run with: npm run seed
 */
require("dotenv").config();
const db = require("../config/db");
const User = require("../models/User");

const doctors = [
  { name: "Dr. Ananya Sharma", department: "cardiology", specialty: "Cardiologist", qualification: "MBBS, MD (Cardiology), DM", experienceYears: 15, image: "doctor1.png" },
  { name: "Dr. Rajeev Verma", department: "neurology", specialty: "Neurologist", qualification: "MBBS, MD (Neurology)", experienceYears: 12, image: "doctor2.png" },
  { name: "Dr. Rohit Singh", department: "orthopedics", specialty: "Orthopedic Surgeon", qualification: "MBBS, MS (Ortho)", experienceYears: 10, image: "doctor3.png" },
  { name: "Dr. Sunil Kumar", department: "ent", specialty: "ENT Specialist", qualification: "MBBS, MS (ENT)", experienceYears: 9, image: "doctor4.png" },
  { name: "Dr. Priya Malhotra", department: "dental", specialty: "Dental Surgeon", qualification: "BDS, MDS", experienceYears: 8, image: "doctor1.png" },
  { name: "Dr. Sanjay Gupta", department: "general", specialty: "General Physician", qualification: "MBBS, MD", experienceYears: 14, image: "doctor2.png" },
  { name: "Dr. Ravi Desai", department: "cardiology", specialty: "Cardiologist", qualification: "MBBS, DM (Cardiology)", experienceYears: 11, image: "doctor3.png" },
  { name: "Dr. Vivek Singh", department: "neurology", specialty: "Neurologist", qualification: "MBBS, DM (Neurology)", experienceYears: 7, image: "doctor4.png" },
  { name: "Dr. Arjun Singh", department: "orthopedics", specialty: "Orthopedic Surgeon", qualification: "MBBS, MS (Ortho)", experienceYears: 13, image: "doctor1.png" },
  { name: "Dr. Kavita Nair", department: "ent", specialty: "ENT Specialist", qualification: "MBBS, MS (ENT)", experienceYears: 6, image: "doctor2.png" },
  { name: "Dr. Pooja Mehta", department: "general", specialty: "General Physician", qualification: "MBBS, MD", experienceYears: 10, image: "doctor3.png" },
  { name: "Dr. Vikram Patel", department: "cardiology", specialty: "Cardiologist", qualification: "MBBS, MD (Cardiology)", experienceYears: 16, image: "doctor4.png" },
];

async function seed() {
  db.set("doctors", []).write();
  doctors.forEach((doc) => db.get("doctors").push(doc).write());
  console.log(`Seeded ${doctors.length} doctors.`);

  const adminEmail = process.env.ADMIN_EMAIL || "admin@doonhospital.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

  const existingAdmin = db.get("users").find({ email: adminEmail }).value();
  if (!existingAdmin) {
    await User.create({
      name: "Hospital Admin",
      email: adminEmail,
      phone: "+91 00000 00000",
      password: adminPassword,
      role: "admin",
    });
    console.log(`Created admin user: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log("Admin user already exists, skipping.");
  }
}

seed().then(() => process.exit(0));
