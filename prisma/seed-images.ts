import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { access, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { productos } from './seed-data/productos';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'La variable DATABASE_URL no está configurada',
  );
}

const apiBaseUrl =
  process.env.SEED_API_URL ??
  'http://localhost:3000/api';

const correo =
  process.env.SEED_USER_EMAIL ??
  'comerciante@gamarra.com';

const password =
  process.env.SEED_USER_PASSWORD ??
  'Comerciante123*';

const rutaImagenesProductos = resolve(
  process.cwd(),
  'prisma',
  'seed-assets',
  'productos',
);

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

interface LoginResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  datos?: {
    accessToken?: string;
    access_token?: string;
    token?: string;
  };
}

interface RegistroImagenResponse {
  mensaje: string;
  imagenId: number;
  productoId: number;
  modelo: string;
  dimension: number;
  hashSha256: string;
  tiempoProcesamientoMs: number;
  estadoProcesamiento: string;
}

function obtenerMimeType(
  nombreArchivo: string,
): string {
  const extension =
    extname(nombreArchivo).toLowerCase();

  switch (extension) {
    case '.webp':
      return 'image/webp';

    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';

    case '.png':
      return 'image/png';

    default:
      throw new Error(
        `Extensión de imagen no permitida: ${extension}`,
      );
  }
}

function extraerToken(
  respuesta: LoginResponse,
): string | undefined {
  return (
    respuesta.accessToken ??
    respuesta.access_token ??
    respuesta.token ??
    respuesta.datos?.accessToken ??
    respuesta.datos?.access_token ??
    respuesta.datos?.token
  );
}

async function validarArchivos(): Promise<number> {
  console.log(
    `Validando imágenes en: ${rutaImagenesProductos}`,
  );

  let totalImagenes = 0;

  for (const producto of productos) {
    for (const imagen of producto.imagenes) {
      const rutaImagen = resolve(
        rutaImagenesProductos,
        producto.carpetaImagenes,
        imagen.archivo,
      );

      try {
        await access(rutaImagen);
      } catch {
        throw new Error(
          `No se encontró la imagen: ${rutaImagen}`,
        );
      }

      totalImagenes++;
    }
  }

  console.log(
    `${totalImagenes} imágenes encontradas correctamente.`,
  );

  return totalImagenes;
}

async function obtenerToken(): Promise<string> {
  const respuesta = await fetch(
    `${apiBaseUrl}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo,
        password,
      }),
    },
  );

  const contenido = await respuesta.text();

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo iniciar sesión: ${respuesta.status} ${contenido}`,
    );
  }

  let resultado: LoginResponse;

  try {
    resultado = JSON.parse(
      contenido,
    ) as LoginResponse;
  } catch {
    throw new Error(
      `La respuesta del login no es un JSON válido: ${contenido}`,
    );
  }

  const token = extraerToken(resultado);

  if (!token) {
    throw new Error(
      `La respuesta del login no contiene un token: ${contenido}`,
    );
  }

  return token;
}

async function subirImagen(
  productoId: number,
  rutaImagen: string,
  nombreArchivo: string,
  token: string,
): Promise<RegistroImagenResponse | null> {
  const buffer = await readFile(rutaImagen);

  const mimeType =
    obtenerMimeType(nombreArchivo);

  const contenidoArchivo =
    new Uint8Array(buffer);

  const formulario = new FormData();

  formulario.append(
    'archivo',
    new Blob([contenidoArchivo], {
      type: mimeType,
    }),
    nombreArchivo,
  );

  const respuesta = await fetch(
    `${apiBaseUrl}/productos/${productoId}/imagenes`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formulario,
    },
  );

  const contenido = await respuesta.text();

  if (respuesta.status === 409) {
    console.log(
      `  Duplicada, se omite: ${nombreArchivo}`,
    );

    return null;
  }

  if (!respuesta.ok) {
    throw new Error(
      `Error al subir ${nombreArchivo}: ${respuesta.status} ${contenido}`,
    );
  }

  try {
    return JSON.parse(
      contenido,
    ) as RegistroImagenResponse;
  } catch {
    throw new Error(
      `La API procesó ${nombreArchivo}, pero devolvió una respuesta inválida: ${contenido}`,
    );
  }
}

async function procesarImagenes(
  token: string,
): Promise<{
  procesadas: number;
  duplicadas: number;
  errores: number;
}> {
  let procesadas = 0;
  let duplicadas = 0;
  let errores = 0;

  for (const productoSeed of productos) {
    const producto =
      await prisma.producto.findUnique({
        where: {
          codigo: productoSeed.codigo,
        },
      });

    if (!producto) {
      throw new Error(
        `No existe el producto ${productoSeed.codigo}. Ejecuta primero npm run seed.`,
      );
    }

    console.log('');
    console.log(
      `Procesando ${productoSeed.codigo} - ${productoSeed.nombre}`,
    );

    const imagenesOrdenadas = [
      ...productoSeed.imagenes,
    ].sort((a, b) => a.orden - b.orden);

    for (const imagen of imagenesOrdenadas) {
      const rutaImagen = resolve(
        rutaImagenesProductos,
        productoSeed.carpetaImagenes,
        imagen.archivo,
      );

      try {
        const resultado = await subirImagen(
          producto.id,
          rutaImagen,
          imagen.archivo,
          token,
        );

        if (!resultado) {
          duplicadas++;
          continue;
        }

        procesadas++;

        console.log(
          `  Procesada: ${imagen.archivo}`,
        );
        console.log(
          `    Imagen ID: ${resultado.imagenId}`,
        );
        console.log(
          `    Dimensión: ${resultado.dimension}`,
        );
        console.log(
          `    Estado: ${resultado.estadoProcesamiento}`,
        );
        console.log(
          `    Tiempo: ${resultado.tiempoProcesamientoMs} ms`,
        );
      } catch (error: unknown) {
        errores++;

        const mensaje =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          `  Error con ${imagen.archivo}: ${mensaje}`,
        );
      }
    }
  }

  return {
    procesadas,
    duplicadas,
    errores,
  };
}

async function main(): Promise<void> {
  console.log(
    'Iniciando seed de imágenes...',
  );
  console.log(`API: ${apiBaseUrl}`);
  console.log(`Usuario: ${correo}`);
  console.log('');

  await validarArchivos();

  console.log('');
  console.log('Iniciando sesión en la API...');

  const token = await obtenerToken();

  console.log(
    'Inicio de sesión realizado correctamente.',
  );

  const resultado =
    await procesarImagenes(token);

  console.log('');
  console.log(
    'Seed de imágenes finalizado.',
  );
  console.log(
    `Imágenes procesadas: ${resultado.procesadas}`,
  );
  console.log(
    `Imágenes duplicadas: ${resultado.duplicadas}`,
  );
  console.log(
    `Imágenes con error: ${resultado.errores}`,
  );

  if (resultado.errores > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error: unknown) => {
    console.error(
      'Error al ejecutar el seed de imágenes:',
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });