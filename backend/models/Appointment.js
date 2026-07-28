const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const APPOINTMENTS = () => db.get("appointments");

function create(data) {
  const appointment = {
    id: uuidv4(),
    userId: data.userId || null,
    name: data.name,
    email: data.email,
    phone: data.phone,
    department: data.department,
    doctor: data.doctor || "Any Available",
    date: data.date,
    time: data.time,
    message: data.message || "",
    status: "pending", // pending | confirmed | cancelled | completed
    createdAt: new Date().toISOString(),
  };
  APPOINTMENTS().push(appointment).write();
  return appointment;
}

function findAll() {
  return APPOINTMENTS().orderBy(["createdAt"], ["desc"]).value();
}

function findByUser(userId) {
  return APPOINTMENTS()
    .filter({ userId })
    .orderBy(["createdAt"], ["desc"])
    .value();
}

function findById(id) {
  return APPOINTMENTS().find({ id }).value();
}

function updateStatus(id, status) {
  const record = APPOINTMENTS().find({ id });
  if (!record.value()) return null;
  record.assign({ status, updatedAt: new Date().toISOString() }).write();
  return record.value();
}

function remove(id) {
  const existed = !!APPOINTMENTS().find({ id }).value();
  APPOINTMENTS().remove({ id }).write();
  return existed;
}

module.exports = { create, findAll, findByUser, findById, updateStatus, remove };
