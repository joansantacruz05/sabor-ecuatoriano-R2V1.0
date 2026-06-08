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

module.exports = {
  findByEmail,
  findByUsername,
  findById,
  createUsuario
};
