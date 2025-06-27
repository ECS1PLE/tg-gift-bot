const fs = require("fs");
const path = "./data/users.json";

function loadUsers() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, "{}");
  return JSON.parse(fs.readFileSync(path));
}

function saveUsers(users) {
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
}

function getOrCreateUser(users, from) {
  if (!users[from.id]) {
    users[from.id] = {
      id: from.id,
      tag: from.username || "",
      stars: 0,
      rigged: false,
    };
    saveUsers(users);
  }
  return users[from.id];
}

module.exports = { loadUsers, saveUsers, getOrCreateUser };
