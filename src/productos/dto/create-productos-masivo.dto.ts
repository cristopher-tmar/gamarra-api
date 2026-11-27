import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

export const MAXIMO_PRODUCTOS_POR_LOTE = 500;

export class CreateProductosMasivoDto {
  @ApiProperty({
    description:
      'Lista de productos a registrar. Cada elemento se valida individualmente con las mismas reglas de POST /productos. ' +
      'Opcionalmente puede incluir "fila" (número de fila en el archivo de origen) para identificarlo en el reporte de errores.',
    type: 'array',
    items: {
      type: 'object',
      additionalProperties: true,
    },
    maxItems: MAXIMO_PRODUCTOS_POR_LOTE,
    example: [
      {
        fila: 2,
        tiendaId: 1,
        codigo: 'POL-101',
        nombre: 'Polo oversize negro',
        categoria: 'Polos',
        descripcion: 'Polo de algodón de corte oversize',
        precio: 49.9,
        stock: 10,
        atributos: {
          marca: 'Topitop',
          material: 'Algodón',
          tallas: ['S', 'M', 'L'],
          colores: ['Negro'],
        },
        estado: true,
      },
      {
        fila: 3,
        tiendaId: 1,
        codigo: 'POL-102',
        nombre: 'Polo oversize blanco',
        categoria: 'Polos',
        precio: 49.9,
        stock: 8,
      },
    ],
  })
  @IsArray({
    message:
      'Los productos deben enviarse como una lista',
  })
  @ArrayNotEmpty({
    message:
      'Debe enviar al menos un producto',
  })
  @ArrayMaxSize(MAXIMO_PRODUCTOS_POR_LOTE, {
    message: `No se pueden registrar más de ${MAXIMO_PRODUCTOS_POR_LOTE} productos por lote`,
  })
  productos: unknown[];
}
