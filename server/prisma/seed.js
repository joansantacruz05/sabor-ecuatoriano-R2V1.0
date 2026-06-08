const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const productos = [
  { nombre: "Encebollado", categoria: "Sopas", descripcion: "Caldo de albacora con yuca, tomate y cebolla curtida.", precio: 8.5, stock: 50, imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=640&q=80" },
  { nombre: "Locro de papa", categoria: "Sopas", descripcion: "Sopa cremosa de papa con queso fresco y aguacate.", precio: 7.0, stock: 40, imagen: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=640&q=80" },
  { nombre: "Caldo de patas", categoria: "Sopas", descripcion: "Caldo de pata de res con maní, mote y aguacate.", precio: 7.5, stock: 35, imagen: "https://images.unsplash.com/photo-1555243896-c709bfa0b564?w=640&q=80" },
  { nombre: "Llapingachos", categoria: "Platos fuertes", descripcion: "Tortillas de papa con queso, chorizo y huevo frito.", precio: 9.5, stock: 30, imagen: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640&q=80" },
  { nombre: "Hornado", categoria: "Platos fuertes", descripcion: "Cerdo horneado con mote y llapingachos.", precio: 12.0, stock: 25, imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?w=640&q=80" },
  { nombre: "Seco de pollo", categoria: "Platos fuertes", descripcion: "Pollo guisado con cerveza y naranjilla.", precio: 9.0, stock: 40, imagen: "https://images.unsplash.com/photo-1604908176997-431836e834d3?w=640&q=80" },
  { nombre: "Ceviche de camarón", categoria: "Mariscos", descripcion: "Camarón fresco con limón y chifles.", precio: 11.0, stock: 30, imagen: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=640&q=80" },
  { nombre: "Encocado de pescado", categoria: "Mariscos", descripcion: "Pescado en salsa de coco con especias.", precio: 13.5, stock: 20, imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b2a2?w=640&q=80" },
  { nombre: "Bolón de verde", categoria: "Desayunos", descripcion: "Masa de plátano verde rellena de queso.", precio: 5.5, stock: 45, imagen: "https://images.unsplash.com/photo-1482049016688-a7be64464687?w=640&q=80" },
  { nombre: "Jugo de naranjilla", categoria: "Bebidas", descripcion: "Refresco natural de naranjilla ecuatoriana.", precio: 2.5, stock: 100, imagen: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=640&q=80" },
  { nombre: "Humitas", categoria: "Snacks", descripcion: "Masa de choclo cocida al vapor en hoja.", precio: 4.5, stock: 50, imagen: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=640&q=80" },
  { nombre: "Tres leches", categoria: "Postres", descripcion: "Bizcocho empapado en crema de tres leches.", precio: 5.0, stock: 35, imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=640&q=80" }
];

async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const userHash = await bcrypt.hash("User12345", 12);

  await prisma.usuario.upsert({
    where: { email: "admin@saborecuatoriano.ec" },
    update: {},
    create: {
      username: "admin",
      email: "admin@saborecuatoriano.ec",
      passwordHash: adminHash,
      role: "admin"
    }
  });

  await prisma.usuario.upsert({
    where: { email: "user@saborecuatoriano.ec" },
    update: {},
    create: {
      username: "usuario",
      email: "user@saborecuatoriano.ec",
      passwordHash: userHash,
      role: "user"
    }
  });

  const count = await prisma.producto.count();
  if (count === 0) {
    await prisma.producto.createMany({ data: productos });
  }

  console.log("Seed completado: usuarios admin/user y catálogo inicial.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
