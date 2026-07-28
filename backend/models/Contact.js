const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const CONTACTS = () => db.get("contacts");

function create({ name, email, subject, message }) {
  const contact = {
    id: uuidv4(),
    name,
    email,
    subject,
    message,
    resolved: false,
    createdAt: new Date().toISOString(),
  };
  CONTACTS().push(contact).write();
  return contact;
}

function findAll() {
  return CONTACTS().orderBy(["createdAt"], ["desc"]).value();
}

function markResolved(id) {
  const record = CONTACTS().find({ id });
  if (!record.value()) return null;
  record.assign({ resolved: true }).write();
  return record.value();
}

module.exports = { create, findAll, markResolved };
