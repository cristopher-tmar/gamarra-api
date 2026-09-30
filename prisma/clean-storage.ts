import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const bucket =
  process.env.SUPABASE_STORAGE_BUCKET ??
  'productos';

if (!supabaseUrl) {
  throw new Error(
    'La variable SUPABASE_URL no está configurada',
  );
}

if (!supabaseServiceRoleKey) {
  throw new Error(
    'La variable SUPABASE_SERVICE_ROLE_KEY no está configurada',
  );
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

async function obtenerArchivos(
  carpeta = '',
): Promise<string[]> {
  const archivosEncontrados: string[] = [];

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(carpeta, {
      limit: 1000,
      offset: 0,
      sortBy: {
        column: 'name',
        order: 'asc',
      },
    });

  if (error) {
    throw new Error(
      `No se pudo listar la carpeta "${carpeta || '/'}": ${error.message}`,
    );
  }

  for (const elemento of data ?? []) {
    const rutaElemento = carpeta
      ? `${carpeta}/${elemento.name}`
      : elemento.name;

    const esCarpeta =
      elemento.id === null &&
      elemento.metadata === null;

    if (esCarpeta) {
      const archivosCarpeta =
        await obtenerArchivos(rutaElemento);

      archivosEncontrados.push(
        ...archivosCarpeta,
      );
    } else {
      archivosEncontrados.push(
        rutaElemento,
      );
    }
  }

  return archivosEncontrados;
}

async function eliminarArchivos(
  archivos: string[],
): Promise<void> {
  const cantidadPorLote = 100;

  for (
    let indice = 0;
    indice < archivos.length;
    indice += cantidadPorLote
  ) {
    const lote = archivos.slice(
      indice,
      indice + cantidadPorLote,
    );

    const { error } = await supabase.storage
      .from(bucket)
      .remove(lote);

    if (error) {
      throw new Error(
        `No se pudo eliminar un lote de imágenes: ${error.message}`,
      );
    }

    console.log(
      `Archivos eliminados: ${Math.min(
        indice + lote.length,
        archivos.length,
      )}/${archivos.length}`,
    );
  }
}

async function main(): Promise<void> {
  console.log(
    'Iniciando limpieza de Supabase Storage...',
  );

  console.log(`Bucket: ${bucket}`);

  const archivos = await obtenerArchivos();

  if (archivos.length === 0) {
    console.log(
      'El bucket ya se encuentra vacío.',
    );

    return;
  }

  console.log(
    `Se encontraron ${archivos.length} archivo(s).`,
  );

  await eliminarArchivos(archivos);

  const archivosRestantes =
    await obtenerArchivos();

  if (archivosRestantes.length > 0) {
    throw new Error(
      `La limpieza no se completó. Quedan ${archivosRestantes.length} archivo(s).`,
    );
  }

  console.log(
    'Supabase Storage fue limpiado correctamente.',
  );
}

main().catch((error: unknown) => {
  const mensaje =
    error instanceof Error
      ? error.message
      : String(error);

  console.error(
    `Error al limpiar Supabase Storage: ${mensaje}`,
  );

  process.exitCode = 1;
});