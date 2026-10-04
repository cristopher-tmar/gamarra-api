import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class BusquedaVisualThrottlerGuard
  extends ThrottlerGuard
{
  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      'Ha superado el límite de búsquedas visuales. Intente nuevamente en un minuto.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}