export interface ImageStorageFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface StoredImage {
  url: string;
  nombreAlmacenado: string;
}

export abstract class ImageStorage {
  abstract guardar(
    productoId: number,
    archivo: ImageStorageFile,
  ): Promise<StoredImage>;

  abstract eliminar(
    nombreAlmacenado: string,
  ): Promise<void>;
}