const prisma = require("./prismaClient");

const baseSelect = {
  id: true, username: true, email: true, createdAt: true,
  rolId: true,
  rol: { select: { nombre: true } }
};

function mapUsuario(u) {
  if (!u) return null;
  const { rol, ...rest } = u;
  return { ...rest, role: rol.nombre };
}

async function findByEmail(email) {
  const u = await prisma.usuario.findUnique({
    where: { email },
    include: { rol: { select: { nombre: true } } }
  });
  return mapUsuario(u);
}

async function findByUsername(username) {
  const u = await prisma.usuario.findUnique({
    where: { username },
    include: { rol: { select: { nombre: true } } }
  });
  return mapUsuario(u);
}

async function findById(id) {
  const u = await prisma.usuario.findUnique({
    where: { id },
    select: baseSelect
  });
  return mapUsuario(u);
}

async function createUsuario({ username, email, passwordHash, rolId }) {
  const u = await prisma.usuario.create({
    data: { username, email, passwordHash, rolId },
    select: baseSelect
  });
  return mapUsuario(u);
}

async function setResetToken(email, token, expiresAt) {
  return prisma.usuario.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiresAt }
  });
}

async function findByResetToken(token) {
  const u = await prisma.usuario.findUnique({
    where: { resetToken: token },
    include: { rol: { select: { nombre: true } } }
  });
  return mapUsuario(u);
}

async function updatePassword(id, passwordHash) {
  const u = await prisma.usuario.update({
    where: { id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    select: baseSelect
  });
  return mapUsuario(u);
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
