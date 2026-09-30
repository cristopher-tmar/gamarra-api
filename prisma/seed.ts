import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
} from '../src/generated/prisma/client';
import * as argon2 from 'argon2';
import { productos } from './seed-data/productos';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'La variable DATABASE_URL no está configurada',
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const usuarios = [
  {
    nombres: 'Administrador',
    apellidos: 'Gamarra',
    correo: 'admin@gamarra.com',
    password: 'Admin123*',
    rol: 'ADMINISTRADOR' as const,
    estado: true,
  },
  {
    nombres: 'Comerciante',
    apellidos: 'Demo',
    correo: 'comerciante@gamarra.com',
    password: 'Comerciante123*',
    rol: 'COMERCIANTE' as const,
    estado: true,
  },
  {
    nombres: 'Cliente',
    apellidos: 'Demo',
    correo: 'cliente@gamarra.com',
    password: 'Cliente123*',
    rol: 'CLIENTE' as const,
    estado: true,
  },
];

const tiendas = [
  {
    codigo: 'TIE-001',
    nombre: 'Moda Urbana Gamarra',
    descripcion:
      'Tienda especializada en prendas urbanas y casuales',
    galeria: 'Galería Azul',
    piso: '2',
    numeroLocal: '205',
    telefono: '999888777',
    estado: true,
  },
  {
    codigo: 'TIE-002',
    nombre: 'Estilo Moderno',
    descripcion:
      'Tienda de ropa moderna para diferentes ocasiones',
    galeria: 'Galería Central',
    piso: '1',
    numeroLocal: '108',
    telefono: '988777666',
    estado: true,
  },
];

async function procesarUsuarios(): Promise<void> {
  for (const usuario of usuarios) {
    const passwordHash = await argon2.hash(
      usuario.password,
    );

    await prisma.usuario.upsert({
      where: {
        correo: usuario.correo,
      },
      update: {
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        passwordHash,
        rol: usuario.rol,
        estado: usuario.estado,
      },
      create: {
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        passwordHash,
        rol: usuario.rol,
        estado: usuario.estado,
      },
    });

    console.log(
      `Usuario procesado: ${usuario.correo}`,
    );
  }
}

async function obtenerComerciante() {
  const comerciante =
    await prisma.usuario.findUnique({
      where: {
        correo: 'comerciante@gamarra.com',
      },
    });

  if (!comerciante) {
    throw new Error(
      'No se encontró el usuario comerciante para asociar las tiendas',
    );
  }

  return comerciante;
}

async function procesarTiendas(
  usuarioId: number,
): Promise<void> {
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
        usuarioId,
      },
      create: {
        codigo: tienda.codigo,
        nombre: tienda.nombre,
        descripcion: tienda.descripcion,
        galeria: tienda.galeria,
        piso: tienda.piso,
        numeroLocal: tienda.numeroLocal,
        telefono: tienda.telefono,
        estado: tienda.estado,
        usuarioId,
      },
    });

    console.log(
      `Tienda procesada: ${tienda.codigo}`,
    );
  }
}

async function procesarProductos(): Promise<void> {
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
        precio: producto.precio,
        stock: producto.stock,
        atributos:
          producto.atributos as Prisma.InputJsonValue,
        estado: producto.estado,
      },
      create: {
        tiendaId: tienda.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        categoria: producto.categoria,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        atributos:
          producto.atributos as Prisma.InputJsonValue,
        estado: producto.estado,
      },
    });

    console.log(
      `Producto procesado: ${producto.codigo} | ${producto.nombre} | ${producto.imagenes.length} imagen(es) pendientes`,
    );
  }
}

async function mostrarResumen(): Promise<void> {
  const totalUsuarios =
    await prisma.usuario.count();

  const totalTiendas =
    await prisma.tienda.count();

  const totalProductos =
    await prisma.producto.count();

  const totalImagenes =
    await prisma.productoImagen.count();

  console.log('');
  console.log(
    'Seed principal ejecutado correctamente.',
  );
  console.log(`Usuarios: ${totalUsuarios}`);
  console.log(`Tiendas: ${totalTiendas}`);
  console.log(`Productos: ${totalProductos}`);
  console.log(
    `Imágenes existentes: ${totalImagenes}`,
  );
  console.log('');
  console.log(
    'Las imágenes se cargan posteriormente con: npm run seed:images',
  );
}

async function main(): Promise<void> {
  console.log('Iniciando seed principal...');
  console.log('');

  await procesarUsuarios();

  const comerciante =
    await obtenerComerciante();

  await procesarTiendas(comerciante.id);

  await procesarProductos();

  await mostrarResumen();
}

main()
  .catch((error: unknown) => {
    console.error(
      'Error al ejecutar el seed principal:',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });