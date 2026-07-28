const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const dbFile = path.join(__dirname, "..", "data", "db.json");
const adapter = new FileSync(dbFile);
const db = low(adapter);

// Default schema - only applied if the file is empty/missing
db.defaults({
  users: [],
  appointments: [],
  contacts: [],
  doctors: [],
}).write();

module.exports = db;
