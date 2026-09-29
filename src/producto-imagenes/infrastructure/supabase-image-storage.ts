import {
  BadGatewayException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import {
  ImageStorage,
  ImageStorageFile,
  StoredImage,
} from '../interfaces/image-storage.interface';

@Injectable()
export class SupabaseImageStorage
  implements ImageStorage
{
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    const supabaseUrl =
      this.configService.getOrThrow<string>(
        'SUPABASE_URL',
      );

    const serviceRoleKey =
      this.configService.getOrThrow<string>(
        'SUPABASE_SERVICE_ROLE_KEY',
      );

    this.bucket =
      this.configService.getOrThrow<string>(
        'SUPABASE_STORAGE_BUCKET',
      );

    this.supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }

  async guardar(
    productoId: number,
    archivo: ImageStorageFile,
  ): Promise<StoredImage> {
    const extension =
      this.obtenerExtension(archivo.originalname);

    const nombreAlmacenado =
      `${productoId}/${randomUUID()}.${extension}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(
        nombreAlmacenado,
        archivo.buffer,
        {
          contentType: archivo.mimetype,
          cacheControl: '3600',
          upsert: false,
        },
      );

    if (error) {
      throw new BadGatewayException(
        `No se pudo almacenar la imagen: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(nombreAlmacenado);

    if (!data.publicUrl) {
      await this.eliminar(nombreAlmacenado);

      throw new BadGatewayException(
        'No se pudo obtener la URL pública de la imagen',
      );
    }

    return {
      url: data.publicUrl,
      nombreAlmacenado,
    };
  }

  async eliminar(
    nombreAlmacenado: string,
  ): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([nombreAlmacenado]);

    if (error) {
      throw new BadGatewayException(
        `No se pudo eliminar la imagen: ${error.message}`,
      );
    }
  }

  private obtenerExtension(
    nombreOriginal: string,
  ): string {
    const partes = nombreOriginal
      .trim()
      .toLowerCase()
      .split('.');

    if (partes.length < 2) {
      return 'jpg';
    }

    const extension = partes.at(-1);

    if (
      extension === 'jpg' ||
      extension === 'jpeg' ||
      extension === 'png' ||
      extension === 'webp'
    ) {
      return extension;
    }

    return 'jpg';
  }
}