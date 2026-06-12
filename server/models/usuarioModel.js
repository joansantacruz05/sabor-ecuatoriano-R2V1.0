const prisma = require("./prismaClient");

async function findByEmail(email) {
  return prisma.usuario.findUnique({ where: { email } });
}

async function findByUsername(username) {
  return prisma.usuario.findUnique({ where: { username } });
}

async function findById(id) {
  return prisma.usuario.findUnique({
    where: { id },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });
}

async function createUsuario({ username, email, passwordHash, role }) {
  return prisma.usuario.create({
    data: { username, email, passwordHash, role },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });
}

async function setResetToken(email, token, expiresAt) {
  return prisma.usuario.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiresAt }
  });
}

async function findByResetToken(token) {
  return prisma.usuario.findUnique({ where: { resetToken: token } });
}

async function updatePassword(id, passwordHash) {
  return prisma.usuario.update({
    where: { id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    select: { id: true, username: true, email: true, role: true, createdAt: true }
  });
}

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUsuario,
  setResetToken,
  findByResetToken,
  updatePassword
};
