const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const productos = [
  { nombre: "Encebollado", categoria: "Sopas", descripcion: "Caldo de albacora con yuca, tomate y cebolla curtida.", precio: 8.5, stock: 50, imagen: "https://storage.googleapis.com/fitia_recipe_images/EC-R-V-00000007%2Fv4%2Frect.jpeg" },
  { nombre: "Locro de papa", categoria: "Sopas", descripcion: "Sopa cremosa de papa con queso fresco y aguacate.", precio: 7.0, stock: 40, imagen: "https://sabor.eluniverso.com/wp-content/uploads/2024/10/OTRA-FOTO-DE-LOCRO-DE-PAPAS-DE-CARLOS-VILLACIS-PARA-REEMPLAZAR-EN-EL-PAPEL.jpg" },
  { nombre: "Caldo de patas", categoria: "Sopas", descripcion: "Caldo de pata de res con maní, mote y aguacate.", precio: 7.5, stock: 35, imagen: "https://rastro.quito.gob.ec/wp-content/uploads/2024/07/CaldoDePatas-1024x683.png" },
  { nombre: "Fanesca", categoria: "Sopas", descripcion: "Sopa tradicional de Semana Santa con doce granos, bacalao y maní.", precio: 10.0, stock: 20, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/fanesca/fanesca_web.jpg" },
  { nombre: "Sopa de quinua", categoria: "Sopas", descripcion: "Caldo reconfortante de quinua real con verduras serranas.", precio: 6.5, stock: 30, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/1c7c9902781c62ebd24ea257fd5a6271.jpg" },
  { nombre: "Llapingachos", categoria: "Platos fuertes", descripcion: "Tortillas de papa con queso, chorizo y huevo frito.", precio: 9.5, stock: 30, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/e6d7bea8148db1d925409b9fa3b8368f.jpg" },
  { nombre: "Hornado", categoria: "Platos fuertes", descripcion: "Cerdo horneado con mote y llapingachos.", precio: 12.0, stock: 25, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/144ff6fad3865ecc6d5d5d3a0daacd06.jpg" },
  { nombre: "Seco de pollo", categoria: "Platos fuertes", descripcion: "Pollo guisado con cerveza y naranjilla.", precio: 9.0, stock: 40, imagen: "https://selloazul.ec/cdn/shop/articles/Seco_Pollo_MINI_BLOG.png?v=1756138344" },
  { nombre: "Fritada", categoria: "Platos fuertes", descripcion: "Trozos de cerdo fritos con mote, maduro y encurtido.", precio: 11.0, stock: 28, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/fritada/fritada_web.jpg" },
  { nombre: "Cuy asado", categoria: "Platos fuertes", descripcion: "Cuy entero asado a la brasa con papas y salsa de maní.", precio: 18.0, stock: 15, imagen: "https://forkandsalt.com/images/primary/cuy-asado.jpg" },
  { nombre: "Ceviche de camarón", categoria: "Mariscos", descripcion: "Camarón fresco con limón y chifles.", precio: 11.0, stock: 30, imagen: "https://www.laylita.com/recetas/wp-content/uploads/1-Ceviche-de-camaron-ecuatoriano.jpg" },
  { nombre: "Encocado de pescado", categoria: "Mariscos", descripcion: "Pescado en salsa de coco con especias.", precio: 13.5, stock: 20, imagen: "https://comedera.com/wp-content/uploads/sites/9/2022/08/pescado-encocado.jpg" },
  { nombre: "Seco de camarón", categoria: "Mariscos", descripcion: "Camarones guisados en salsa de tomate y hierbas finas.", precio: 12.5, stock: 25, imagen: "https://img-global.cpcdn.com/recipes/7f584265d8fe0eda/1200x630cq80/photo.jpg" },
  { nombre: "Arroz con menestra y pescado", categoria: "Mariscos", descripcion: "Filete de pescado frito con arroz y menestra de lenteja.", precio: 10.5, stock: 30, imagen: "https://forkandsalt.com/images/primary/arroz-con-menestra-y-carne-asada.jpg" },
  { nombre: "Bolón de verde", categoria: "Desayunos", descripcion: "Masa de plátano verde rellena de queso.", precio: 5.5, stock: 45, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/bolon-de-verde-mixto/bolon-de-verde-mixto_web.jpg" },
  { nombre: "Tigrillo", categoria: "Desayunos", descripcion: "Plátano verde aplastado y frito con queso, huevo y mantequilla.", precio: 6.0, stock: 35, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/tigrillo/tigrillo_web.jpg" },
  { nombre: "Sánduche de pernil", categoria: "Desayunos", descripcion: "Pan redondo relleno de pernil jugoso con encurtido y ají.", precio: 4.5, stock: 50, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/b5f6200fed93d3fbcfe750fda3d3e257.jpg" },
  { nombre: "Jugo de naranjilla", categoria: "Bebidas", descripcion: "Refresco natural de naranjilla ecuatoriana.", precio: 2.5, stock: 100, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/jugo-de-naranjilla/jugo-de-naranjilla_web.jpg.webp" },
  { nombre: "Colada morada", categoria: "Bebidas", descripcion: "Bebida ancestral de harina de maíz morado con frutas tropicales.", precio: 3.0, stock: 60, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/colada-morada/colada-morada_web.jpg" },
  { nombre: "Chicha de jora", categoria: "Bebidas", descripcion: "Bebida fermentada artesanal de maíz jora con especias.", precio: 2.0, stock: 80, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/chicha-de-jora/chicha-de-jora_web.jpg" },
  { nombre: "Jugo de tomate de árbol", categoria: "Bebidas", descripcion: "Zumo natural de tamarillo con un toque de canela.", precio: 2.5, stock: 90, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/jugo-de-tomate-de-arbol/jugo-de-tomate-de-arbol_web.jpg" },
  { nombre: "Humitas", categoria: "Snacks", descripcion: "Masa de choclo cocida al vapor en hoja.", precio: 4.5, stock: 50, imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxTrqkMMJ5kukleD9iRfnx3Yp7WznSjjA7FQ&s" },
  { nombre: "Chifles", categoria: "Snacks", descripcion: "Rodajas crujientes de plátano verde frito con sal.", precio: 2.0, stock: 100, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/c1ac3118ac167963926e6b7a97516433.jpg" },
  { nombre: "Canguil de canela", categoria: "Snacks", descripcion: "Palomitas de maíz caramelizadas con canela y panela.", precio: 2.5, stock: 70, imagen: "https://www.recetasnestle.com.ec/sites/default/files/srh_recipes/dab0bafdbbff3f813e563b6bd03d4014.jpg" },
  { nombre: "Tres leches", categoria: "Postres", descripcion: "Bizcocho empapado en crema de tres leches.", precio: 5.0, stock: 35, imagen: "https://cdn0.recetasgratis.net/es/posts/0/1/9/torta_tres_leches_8910_600.jpg" },
  { nombre: "Pristiños con miel", categoria: "Postres", descripcion: "Buñuelos en forma de rosquilla bañados en miel de panela.", precio: 4.0, stock: 40, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/pristinos/pristinos_web.jpg" },
  { nombre: "Dulce de higos", categoria: "Postres", descripcion: "Higos en almíbar de panela con queso fresco serrano.", precio: 4.5, stock: 30, imagen: "/api/proxy-image?url=https://www.cocina-ecuatoriana.com/base/stock/Recipe/dulce-de-higos/dulce-de-higos_web.jpg" },
];

async function main() {
  const adminHash = await bcrypt.hash("Admin123!", 12);
  const userHash = await bcrypt.hash("User12345", 12);

  const rolAdmin = await prisma.rol.upsert({
    where: { nombre: "admin" },
    update: {},
    create: { nombre: "admin" }
  });
  const rolUser = await prisma.rol.upsert({
    where: { nombre: "user" },
    update: {},
    create: { nombre: "user" }
  });

  const nombresCategoria = [...new Set(productos.map(function (p) { return p.categoria; }))];
  const categoriasMap = {};
  for (const nombre of nombresCategoria) {
    const cat = await prisma.categoria.upsert({
      where: { nombre: nombre },
      update: {},
      create: { nombre: nombre }
    });
    categoriasMap[nombre] = cat.id;
  }

  await prisma.usuario.upsert({
    where: { email: "admin@saborecuatoriano.ec" },
    update: {},
    create: {
      username: "admin",
      email: "admin@saborecuatoriano.ec",
      passwordHash: adminHash,
      rolId: rolAdmin.id
    }
  });

  await prisma.usuario.upsert({
    where: { email: "user@saborecuatoriano.ec" },
    update: {},
    create: {
      username: "usuario",
      email: "user@saborecuatoriano.ec",
      passwordHash: userHash,
      rolId: rolUser.id
    }
  });

  await prisma.pedidoDetalle.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.producto.deleteMany();

  const productosConCategoria = productos.map(function (p) {
    return {
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion,
      imagen: p.imagen,
      categoriaId: categoriasMap[p.categoria]
    };
  });
  await prisma.producto.createMany({ data: productosConCategoria });

  console.log("Seed completado: roles, categorías, usuarios y catálogo inicial.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
