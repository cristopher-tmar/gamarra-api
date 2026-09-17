import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('La variable DATABASE_URL no está configurada');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const tiendas = [
  {
    codigo: 'TIE-001',
    nombre: 'Moda Urbana Gamarra',
    descripcion: 'Tienda especializada en prendas urbanas y casuales',
    galeria: 'Galería Azul',
    piso: '2',
    numeroLocal: '205',
    telefono: '999888777',
    estado: true,
  },
  {
    codigo: 'TIE-002',
    nombre: 'Estilo Moderno',
    descripcion: 'Tienda de ropa moderna para diferentes ocasiones',
    galeria: 'Galería Central',
    piso: '1',
    numeroLocal: '108',
    telefono: '988777666',
    estado: true,
  },
];

const productos = [
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'POL-001',
    nombre: 'Polo oversize negro',
    categoria: 'Polos',
    descripcion: 'Polo de algodón con corte oversize y estilo urbano',
    color: 'Negro',
    talla: 'M',
    precio: 45.9,
    stock: 20,
    imagenUrl: null,
    estado: true,
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'POL-002',
    nombre: 'Polo básico blanco',
    categoria: 'Polos',
    descripcion: 'Polo básico de algodón para uso casual',
    color: 'Blanco',
    talla: 'L',
    precio: 35,
    stock: 30,
    imagenUrl: null,
    estado: true,
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'CAS-001',
    nombre: 'Casaca denim azul',
    categoria: 'Casacas',
    descripcion: 'Casaca de denim azul con bolsillos delanteros',
    color: 'Azul',
    talla: 'M',
    precio: 89.9,
    stock: 12,
    imagenUrl: null,
    estado: true,
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'PAN-001',
    nombre: 'Pantalón cargo beige',
    categoria: 'Pantalones',
    descripcion: 'Pantalón cargo con bolsillos laterales',
    color: 'Beige',
    talla: '32',
    precio: 75.5,
    stock: 18,
    imagenUrl: null,
    estado: true,
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'VES-001',
    nombre: 'Vestido casual floreado',
    categoria: 'Vestidos',
    descripcion: 'Vestido casual con diseño floreado',
    color: 'Multicolor',
    talla: 'S',
    precio: 69.9,
    stock: 10,
    imagenUrl: null,
    estado: true,
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'POL-003',
    nombre: 'Polera urbana gris',
    categoria: 'Poleras',
    descripcion: 'Polera de algodón con capucha y bolsillo delantero',
    color: 'Gris',
    talla: 'L',
    precio: 79.9,
    stock: 15,
    imagenUrl: null,
    estado: true,
  },
];

async function main(): Promise<void> {
  console.log('Iniciando seed...');

  for (const tienda of tiendas) {
    await prisma.tienda.upsert({
      where: {
        codigo: tienda.codigo,
      },
      update: {
        nombre: tienda.nombre,
        descripcion: tienda.descripcion,
        galeria: tienda.galeria,
        piso: tienda.piso,
        numeroLocal: tienda.numeroLocal,
        telefono: tienda.telefono,
        estado: tienda.estado,
      },
      create: tienda,
    });

    console.log(`Tienda procesada: ${tienda.codigo}`);
  }

  for (const producto of productos) {
    const tienda = await prisma.tienda.findUnique({
      where: {
        codigo: producto.tiendaCodigo,
      },
    });

    if (!tienda) {
      throw new Error(
        `No se encontró la tienda ${producto.tiendaCodigo}`,
      );
    }

    await prisma.producto.upsert({
      where: {
        codigo: producto.codigo,
      },
      update: {
        tiendaId: tienda.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        color: producto.color,
        talla: producto.talla,
        precio: producto.precio,
        stock: producto.stock,
        imagenUrl: producto.imagenUrl,
        estado: producto.estado,
      },
      create: {
        tiendaId: tienda.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        color: producto.color,
        talla: producto.talla,
        precio: producto.precio,
        stock: producto.stock,
        imagenUrl: producto.imagenUrl,
        estado: producto.estado,
      },
    });

    console.log(
      `Producto procesado: ${producto.codigo} → ${tienda.codigo}`,
    );
  }

  const totalTiendas = await prisma.tienda.count();
  const totalProductos = await prisma.producto.count();

  console.log('Seed ejecutado correctamente.');
  console.log(`Total de tiendas: ${totalTiendas}`);
  console.log(`Total de productos: ${totalProductos}`);
}

main()
  .catch((error: unknown) => {
    console.error('Error al ejecutar el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });