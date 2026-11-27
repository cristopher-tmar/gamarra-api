import type { JwtPayload } from '../auth/guards/jwt-auth.guard';
import { RolUsuario } from '../generated/prisma/enums';
import type { ImageStorage } from '../producto-imagenes/interfaces/image-storage.interface';
import type { PrismaService } from '../prisma/prisma.service';
import { ProductosService } from './productos.service';

/*
 * El cliente generado de Prisma usa imports ESM (.js) que Jest
 * no resuelve; se reemplaza por lo mínimo que usa el servicio.
 */
jest.mock('../generated/prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class extends Error {
      code = '';
    },
  },
}));

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class {},
}));

describe('ProductosService.createMany', () => {
  const comerciante = {
    sub: 10,
    rol: RolUsuario.COMERCIANTE,
  } as JwtPayload;

  const productoBase = {
    tiendaId: 1,
    nombre: 'Polo oversize',
    categoria: 'Polos',
    precio: 49.9,
    stock: 10,
  };

  let codigosExistentes: Set<string>;
  let siguienteId: number;
  let service: ProductosService;

  beforeEach(() => {
    codigosExistentes = new Set(['EXI-001']);
    siguienteId = 100;

    const prisma = {
      tienda: {
        findUnique: jest.fn(
          ({ where }: { where: { id: number } }) =>
            Promise.resolve(
              where.id === 1
                ? { id: 1, usuarioId: 10 }
                : where.id === 2
                  ? { id: 2, usuarioId: 99 }
                  : null,
            ),
        ),
      },
      producto: {
        findUnique: jest.fn(
          ({ where }: { where: { codigo: string } }) =>
            Promise.resolve(
              codigosExistentes.has(where.codigo)
                ? { id: 1, codigo: where.codigo }
                : null,
            ),
        ),
        create: jest.fn(
          ({
            data,
          }: {
            data: { codigo: string; nombre: string };
          }) => {
            codigosExistentes.add(data.codigo);

            return Promise.resolve({
              id: siguienteId++,
              ...data,
            });
          },
        ),
      },
    } as unknown as PrismaService;

    service = new ProductosService(
      prisma,
      {} as ImageStorage,
    );
  });

  it('registra los válidos y reporta los rechazados con fila, código y motivos', async () => {
    const resultado = await service.createMany(
      {
        productos: [
          { ...productoBase, fila: 2, codigo: 'POL-001' },
          { ...productoBase, fila: 3, codigo: 'POL-001' },
          { ...productoBase, fila: 4, codigo: 'POL-002', nombre: '' },
          { ...productoBase, fila: 5, codigo: 'EXI-001' },
          { ...productoBase, fila: 6, codigo: 'POL-003', tiendaId: 2 },
          { ...productoBase, fila: 7, codigo: 'POL-004', tiendaId: 3 },
          { ...productoBase, fila: 8, codigo: 'POL-005', extra: 1 },
          'no es un objeto',
          { ...productoBase, fila: 10, codigo: 'POL-006', precio: -1 },
          { ...productoBase, fila: 11, codigo: 'POL-007' },
        ],
      },
      comerciante,
    );

    expect(resultado.totalRecibidos).toBe(10);
    expect(resultado.registrados).toBe(2);
    expect(resultado.rechazados).toBe(8);

    expect(
      resultado.productosRegistrados,
    ).toEqual([
      { fila: 2, id: 100, codigo: 'POL-001', nombre: 'Polo oversize' },
      { fila: 11, id: 101, codigo: 'POL-007', nombre: 'Polo oversize' },
    ]);

    const filas = resultado.errores.map(
      (error) => error.fila,
    );

    expect(filas).toEqual([3, 4, 5, 6, 7, 8, 8, 10]);

    const porFila = (fila: number, codigo: string | null) =>
      resultado.errores.find(
        (error) =>
          error.fila === fila &&
          error.codigo === codigo,
      );

    expect(porFila(3, 'POL-001')?.motivos[0]).toContain(
      'repetido en el lote (fila 2)',
    );
    expect(porFila(4, 'POL-002')?.motivos).toContain(
      'El nombre del producto es obligatorio',
    );
    expect(porFila(5, 'EXI-001')?.motivos).toEqual([
      'Ya existe un producto con el código EXI-001',
    ]);
    expect(porFila(6, 'POL-003')?.motivos).toEqual([
      'No tiene permisos para registrar productos en esta tienda',
    ]);
    expect(porFila(7, 'POL-004')?.motivos).toEqual([
      'No existe una tienda con el ID 3',
    ]);
    expect(porFila(8, 'POL-005')?.motivos[0]).toContain(
      'extra',
    );
    expect(porFila(8, null)?.motivos).toEqual([
      'El producto debe enviarse como un objeto JSON',
    ]);
    expect(porFila(10, 'POL-006')?.motivos).toContain(
      'El precio no puede ser menor que 0',
    );
  });

  it('usa la posición en la lista cuando no se envía fila', async () => {
    const resultado = await service.createMany(
      {
        productos: [
          { ...productoBase, codigo: 'POL-010' },
          { ...productoBase, codigo: 'POL-010' },
        ],
      },
      comerciante,
    );

    expect(resultado.registrados).toBe(1);
    expect(resultado.errores).toEqual([
      {
        fila: 2,
        codigo: 'POL-010',
        motivos: [
          'El código POL-010 está repetido en el lote (fila 1)',
        ],
      },
    ]);
  });
});
