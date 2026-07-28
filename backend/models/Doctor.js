const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const DOCTORS = () => db.get("doctors");

function findAll() {
  return DOCTORS().value();
}

function findByDepartment(department) {
  return DOCTORS().filter({ department }).value();
}

function findById(id) {
  return DOCTORS().find({ id }).value();
}

function create(data) {
  const doctor = { id: uuidv4(), ...data };
  DOCTORS().push(doctor).write();
  return doctor;
}

function update(id, data) {
  const record = DOCTORS().find({ id });
  if (!record.value()) return null;
  record.assign(data).write();
  return record.value();
}

function remove(id) {
  const existed = !!DOCTORS().find({ id }).value();
  DOCTORS().remove({ id }).write();
  return existed;
}

module.exports = { findAll, findByDepartment, findById, create, update, remove };
