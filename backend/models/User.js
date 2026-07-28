const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const db = require("../config/db");

const USERS = () => db.get("users");

async function create({ name, email, phone, password, role = "patient" }) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role, // "patient" | "admin"
    createdAt: new Date().toISOString(),
  };
  USERS().push(user).write();
  return user;
}

function findByEmail(email) {
  return USERS().find({ email: email.toLowerCase() }).value();
}

function findById(id) {
  return USERS().find({ id }).value();
}

function toPublic(user) {
  if (!user) return null;
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

module.exports = { create, findByEmail, findById, toPublic };
