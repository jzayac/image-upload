'use strict'

const USER_ROLE = 4;
const EDITOR_ROLE = 2;
const ADMIN_ROLE = 1;

function isEditor(role) {
  return role <= EDITOR_ROLE;
}

function isUser(role) {
  return role <= USER_ROLE;
}

function isAdmin(role) {
  return role === ADMIN_ROLE;
}

module.exports = {
  roles: {
    user: USER_ROLE,
    admin: ADMIN_ROLE,
  },
  isUser: isUser,
  isAdmin: isAdmin,
  isEditor: isEditor,
}
