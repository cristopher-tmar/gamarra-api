import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as argon2 from 'argon2';

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
    precio: 45.9,
    stock: 20,
    atributos: {
      colores: ['Negro'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Oversize',
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=POL-001-Frontal',
        nombreOriginal: 'pol-001-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
      {
        url: 'https://placehold.co/800x1000?text=POL-001-Posterior',
        nombreOriginal: 'pol-001-posterior.jpg',
        mimeType: 'image/jpeg',
        principal: false,
        orden: 2,
        estado: true,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'POL-002',
    nombre: 'Polo básico blanco',
    categoria: 'Polos',
    descripcion: 'Polo básico de algodón para uso casual',
    precio: 35,
    stock: 30,
    atributos: {
      colores: ['Blanco'],
      tallas: ['M', 'L', 'XL'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Básico',
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=POL-002-Frontal',
        nombreOriginal: 'pol-002-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'CAS-001',
    nombre: 'Casaca denim azul',
    categoria: 'Casacas',
    descripcion: 'Casaca de denim azul con bolsillos delanteros',
    precio: 89.9,
    stock: 12,
    atributos: {
      colores: ['Azul'],
      tallas: ['S', 'M', 'L'],
      material: 'Denim',
      tipoCierre: 'Botones',
      estilo: 'Casual',
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=CAS-001-Frontal',
        nombreOriginal: 'cas-001-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
      {
        url: 'https://placehold.co/800x1000?text=CAS-001-Posterior',
        nombreOriginal: 'cas-001-posterior.jpg',
        mimeType: 'image/jpeg',
        principal: false,
        orden: 2,
        estado: true,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'PAN-001',
    nombre: 'Pantalón cargo beige',
    categoria: 'Pantalones',
    descripcion: 'Pantalón cargo con bolsillos laterales',
    precio: 75.5,
    stock: 18,
    atributos: {
      colores: ['Beige'],
      tallas: ['30', '32', '34'],
      material: 'Drill',
      tipoCorte: 'Cargo',
      cantidadBolsillos: 6,
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=PAN-001-Frontal',
        nombreOriginal: 'pan-001-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'VES-001',
    nombre: 'Vestido casual floreado',
    categoria: 'Vestidos',
    descripcion: 'Vestido casual con diseño floreado',
    precio: 69.9,
    stock: 10,
    atributos: {
      colores: ['Multicolor'],
      tallas: ['S', 'M'],
      material: 'Viscosa',
      largo: 'Midi',
      ocasion: 'Casual',
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=VES-001-Frontal',
        nombreOriginal: 'ves-001-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'POL-003',
    nombre: 'Polera urbana gris',
    categoria: 'Poleras',
    descripcion: 'Polera de algodón con capucha y bolsillo delantero',
    precio: 79.9,
    stock: 15,
    atributos: {
      colores: ['Gris'],
      tallas: ['M', 'L', 'XL'],
      material: 'Algodón',
      tieneCapucha: true,
      estilo: 'Urbano',
    },
    estado: true,
    imagenes: [
      {
        url: 'https://placehold.co/800x1000?text=POL-003-Frontal',
        nombreOriginal: 'pol-003-frontal.jpg',
        mimeType: 'image/jpeg',
        principal: true,
        orden: 1,
        estado: true,
      },
      {
        url: 'https://placehold.co/800x1000?text=POL-003-Posterior',
        nombreOriginal: 'pol-003-posterior.jpg',
        mimeType: 'image/jpeg',
        principal: false,
        orden: 2,
        estado: true,
      },
    ],
  },
];

async function main(): Promise<void> {
  console.log('Iniciando seed...');

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

    console.log(`Usuario procesado: ${usuario.correo}`);
  }

  const comerciante = await prisma.usuario.findUnique({
    where: {
      correo: 'comerciante@gamarra.com',
    },
  });

  if (!comerciante) {
    throw new Error(
      'No se encontró el usuario comerciante para asociar las tiendas',
    );
  }

  for (const tienda of tiendas) {
    await prisma.tienda.upsert({
      where: {
        codigo: tienda.codigo,
      },
      update: {
        ...tienda,
        usuarioId: comerciante.id,
      },
      create: {
        ...tienda,
        usuarioId: comerciante.id,
      },
    });

    console.log(`Tienda procesada: ${tienda.codigo}`);
  }

  for (const producto of productos) {
    const { tiendaCodigo, imagenes, ...datosProducto } = producto;

    const tienda = await prisma.tienda.findUnique({
      where: {
        codigo: tiendaCodigo,
      },
    });

    if (!tienda) {
      throw new Error(`No se encontró la tienda ${tiendaCodigo}`);
    }

    const productoGuardado = await prisma.producto.upsert({
      where: {
        codigo: datosProducto.codigo,
      },
      update: {
        tiendaId: tienda.id,
        nombre: datosProducto.nombre,
        categoria: datosProducto.categoria,
        descripcion: datosProducto.descripcion,
        precio: datosProducto.precio,
        stock: datosProducto.stock,
        atributos: datosProducto.atributos,
        estado: datosProducto.estado,
      },
      create: {
        tiendaId: tienda.id,
        ...datosProducto,
      },
    });

    for (const imagen of imagenes) {
      await prisma.productoImagen.upsert({
        where: {
          productoId_url: {
            productoId: productoGuardado.id,
            url: imagen.url,
          },
        },
        update: {
          nombreOriginal: imagen.nombreOriginal,
          mimeType: imagen.mimeType,
          principal: imagen.principal,
          orden: imagen.orden,
          estado: imagen.estado,
        },
        create: {
          productoId: productoGuardado.id,
          ...imagen,
        },
      });
    }

    console.log(
      `Producto procesado: ${producto.codigo} con ${imagenes.length} imagen(es)`,
    );
  }

  const totalUsuarios = await prisma.usuario.count();
  const totalTiendas = await prisma.tienda.count();
  const totalProductos = await prisma.producto.count();
  const totalImagenes = await prisma.productoImagen.count();

  console.log('Seed ejecutado correctamente.');
  console.log(`Usuarios: ${totalUsuarios}`);
  console.log(`Tiendas: ${totalTiendas}`);
  console.log(`Productos: ${totalProductos}`);
  console.log(`Imágenes: ${totalImagenes}`);
}

main()
  .catch((error: unknown) => {
    console.error('Error al ejecutar el seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });