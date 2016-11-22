'use strict'

const USER_ROLE = 20;
const ADMIN_ROLE = 100;

function isUser(role) {
  return role >= USER_ROLE;
}

function isAdmin(role) {
  return role === ADMIN_ROLE
}

module.exports = {
  roles: {
    user: USER_ROLE,
    admin: ADMIN_ROLE,
  },
  isUser: isUser,
  isAdmin: isAdmin,
}
