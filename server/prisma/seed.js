const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const productos = [
  { nombre: "Encebollado", categoria: "Sopas", descripcion: "Caldo de albacora con yuca, tomate y cebolla curtida.", precio: 8.5, stock: 50, imagen: "https://storage.googleapis.com/fitia_recipe_images/EC-R-V-00000007%2Fv4%2Frect.jpeg" },
  { nombre: "Locro de papa", categoria: "Sopas", descripcion: "Sopa cremosa de papa con queso fresco y aguacate.", precio: 7.0, stock: 40, imagen: "https://sabor.eluniverso.com/wp-content/uploads/2024/10/OTRA-FOTO-DE-LOCRO-DE-PAPAS-DE-CARLOS-VILLACIS-PARA-REEMPLAZAR-EN-EL-PAPEL.jpg" },
  { nombre: "Caldo de patas", categoria: "Sopas", descripcion: "Caldo de pata de res con maní, mote y aguacate.", precio: 7.5, stock: 35, imagen: "https://rastro.quito.gob.ec/wp-content/uploads/2024/07/CaldoDePatas-1024x683.png" },
  { nombre: "Llapingachos", categoria: "Platos fuertes", descripcion: "Tortillas de papa con queso, chorizo y huevo frito.", precio: 9.5, stock: 30, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/e6d7bea8148db1d925409b9fa3b8368f.jpg" },
  { nombre: "Hornado", categoria: "Platos fuertes", descripcion: "Cerdo horneado con mote y llapingachos.", precio: 12.0, stock: 25, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/144ff6fad3865ecc6d5d5d3a0daacd06.jpg" },
  { nombre: "Seco de pollo", categoria: "Platos fuertes", descripcion: "Pollo guisado con cerveza y naranjilla.", precio: 9.0, stock: 40, imagen: "https://selloazul.ec/cdn/shop/articles/Seco_Pollo_MINI_BLOG.png?v=1756138344" },
  { nombre: "Ceviche de camarón", categoria: "Mariscos", descripcion: "Camarón fresco con limón y chifles.", precio: 11.0, stock: 30, imagen: "https://www.laylita.com/recetas/wp-content/uploads/1-Ceviche-de-camaron-ecuatoriano.jpg" },
  { nombre: "Encocado de pescado", categoria: "Mariscos", descripcion: "Pescado en salsa de coco con especias.", precio: 13.5, stock: 20, imagen: "https://comedera.com/wp-content/uploads/sites/9/2022/08/pescado-encocado.jpg" },
  { nombre: "Bolón de verde", categoria: "Desayunos", descripcion: "Masa de plátano verde rellena de queso.", precio: 5.5, stock: 45, imagen: "https://www.cocina-ecuatoriana.com/base/stock/Recipe/bolon-de-verde-mixto/bolon-de-verde-mixto_web.jpg" },
  { nombre: "Jugo de naranjilla", categoria: "Bebidas", descripcion: "Refresco natural de naranjilla ecuatoriana.", precio: 2.5, stock: 100, imagen: "https://www.cocina-ecuatoriana.com/base/stock/Recipe/jugo-de-naranjilla/jugo-de-naranjilla_web.jpg.webp" },
  { nombre: "Humitas", categoria: "Snacks", descripcion: "Masa de choclo cocida al vapor en hoja.", precio: 4.5, stock: 50, imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxTrqkMMJ5kukleD9iRfnx3Yp7WznSjjA7FQ&s" },
  { nombre: "Tres leches", categoria: "Postres", descripcion: "Bizcocho empapado en crema de tres leches.", precio: 5.0, stock: 35, imagen: "https://cdn0.recetasgratis.net/es/posts/0/1/9/torta_tres_leches_8910_600.jpg" }
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
