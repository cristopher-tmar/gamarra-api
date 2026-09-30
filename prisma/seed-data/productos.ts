export interface ImagenSeed {
  archivo: string;
  orden: number;
}

export interface ProductoSeed {
  tiendaCodigo: string;
  codigo: string;
  nombre: string;
  categoria: string;
  descripcion: string;
  precio: number;
  stock: number;
  atributos: Record<
    string,
    string | string[] | number | boolean
  >;
  estado: boolean;
  carpetaImagenes: string;
  imagenes: ImagenSeed[];
}

export const productos: ProductoSeed[] = [
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'BAS-001',
    nombre: 'Polo Basement cuello camisero beige',
    categoria: 'Polos',
    descripcion:
      'Polo beige de manga corta con cuello camisero y estilo casual',
    precio: 59.9,
    stock: 18,
    atributos: {
      colores: ['Beige'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Camisero',
      tipoManga: 'Corta',
      estilo: 'Casual',
      marca: 'Basement',
    },
    estado: true,
    carpetaImagenes: 'basement',
    imagenes: [
      {
        archivo: 'basement1.webp',
        orden: 1,
      },
      {
        archivo: 'basement2.webp',
        orden: 2,
      },
      {
        archivo: 'basement3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'BEA-001',
    nombre: 'Polo Bearcliff marrón estampado',
    categoria: 'Polos',
    descripcion:
      'Polo marrón de manga corta con estampado frontal y posterior',
    precio: 54.9,
    stock: 16,
    atributos: {
      colores: ['Marrón'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Urbano',
      marca: 'Bearcliff',
    },
    estado: true,
    carpetaImagenes: 'bearcliff',
    imagenes: [
      {
        archivo: 'bearcliff1.webp',
        orden: 1,
      },
      {
        archivo: 'bearcliff2.webp',
        orden: 2,
      },
      {
        archivo: 'bearcliff3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'DEN-001',
    nombre: 'Polera Denimlab marrón',
    categoria: 'Poleras',
    descripcion:
      'Polera marrón de manga larga con cuello redondo y diseño minimalista',
    precio: 79.9,
    stock: 14,
    atributos: {
      colores: ['Marrón'],
      tallas: ['M', 'L', 'XL'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Larga',
      estilo: 'Casual',
      marca: 'Denimlab',
    },
    estado: true,
    carpetaImagenes: 'denimlab',
    imagenes: [
      {
        archivo: 'denimlab1.webp',
        orden: 1,
      },
      {
        archivo: 'denimlab2.webp',
        orden: 2,
      },
      {
        archivo: 'denimlab3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-001',
    codigo: 'IND-001',
    nombre: 'Polo Index marrón clásico',
    categoria: 'Polos',
    descripcion:
      'Polo marrón de manga corta con diseño clásico y corte regular',
    precio: 49.9,
    stock: 20,
    atributos: {
      colores: ['Marrón'],
      tallas: ['S', 'M', 'L', 'XL'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Clásico',
      marca: 'Index',
    },
    estado: true,
    carpetaImagenes: 'index',
    imagenes: [
      {
        archivo: 'index1.webp',
        orden: 1,
      },
      {
        archivo: 'index2.webp',
        orden: 2,
      },
      {
        archivo: 'index3.webp',
        orden: 3,
      },
      {
        archivo: 'index4.webp',
        orden: 4,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'LAM-001',
    nombre: 'Polo La Martina rosado estampado',
    categoria: 'Polos',
    descripcion:
      'Polo rosado de manga corta con estampado posterior',
    precio: 69.9,
    stock: 12,
    atributos: {
      colores: ['Rosado'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Casual',
      marca: 'La Martina',
    },
    estado: true,
    carpetaImagenes: 'lamartina',
    imagenes: [
      {
        archivo: 'lamartina1.webp',
        orden: 1,
      },
      {
        archivo: 'lamartina2.webp',
        orden: 2,
      },
      {
        archivo: 'lamartina3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'RIF-001',
    nombre: 'Polo Riff Raff beige',
    categoria: 'Polos',
    descripcion:
      'Polo beige de manga corta con corte regular y estilo minimalista',
    precio: 44.9,
    stock: 22,
    atributos: {
      colores: ['Beige'],
      tallas: ['S', 'M', 'L', 'XL'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Minimalista',
      marca: 'Riff Raff',
    },
    estado: true,
    carpetaImagenes: 'riffraff',
    imagenes: [
      {
        archivo: 'riffraff1.webp',
        orden: 1,
      },
      {
        archivo: 'riffraff2.webp',
        orden: 2,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'SAG-001',
    nombre: 'Polo Saga marrón',
    categoria: 'Polos',
    descripcion:
      'Polo marrón de manga corta con cuello redondo y corte regular',
    precio: 47.9,
    stock: 19,
    atributos: {
      colores: ['Marrón'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Casual',
      marca: 'Saga',
    },
    estado: true,
    carpetaImagenes: 'saga',
    imagenes: [
      {
        archivo: 'saga1.webp',
        orden: 1,
      },
      {
        archivo: 'saga2.webp',
        orden: 2,
      },
      {
        archivo: 'saga3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'SAG-002',
    nombre: 'Polo Saga oversize marrón estampado',
    categoria: 'Polos',
    descripcion:
      'Polo marrón de corte oversize con estampado posterior',
    precio: 55.9,
    stock: 17,
    atributos: {
      colores: ['Marrón'],
      tallas: ['S', 'M', 'L'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Oversize',
      marca: 'Saga',
    },
    estado: true,
    carpetaImagenes: 'saga-oversize',
    imagenes: [
      {
        archivo: 'sagaOversize1.webp',
        orden: 1,
      },
      {
        archivo: 'sagaOversize2.webp',
        orden: 2,
      },
      {
        archivo: 'sagaOversize3.webp',
        orden: 3,
      },
    ],
  },
  {
    tiendaCodigo: 'TIE-002',
    codigo: 'TOP-001',
    nombre: 'Polo Topitop oversize marrón',
    categoria: 'Polos',
    descripcion:
      'Polo marrón de corte oversize, manga corta y estilo urbano',
    precio: 49.9,
    stock: 20,
    atributos: {
      colores: ['Marrón'],
      tallas: ['S', 'M', 'L', 'XL'],
      material: 'Algodón',
      tipoCuello: 'Redondo',
      tipoManga: 'Corta',
      estilo: 'Oversize',
      marca: 'Topitop',
    },
    estado: true,
    carpetaImagenes: 'topitop',
    imagenes: [
      {
        archivo: 'topitop1.webp',
        orden: 1,
      },
      {
        archivo: 'topitop2.webp',
        orden: 2,
      },
      {
        archivo: 'topitop3.jpg',
        orden: 3,
      },
      {
        archivo: 'topitop4.webp',
        orden: 4,
      },
    ],
  },
];