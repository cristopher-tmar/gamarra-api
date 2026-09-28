export interface VisionFileResponse {
  nombreOriginal: string | null;
  mimeType: string | null;
  tamanioBytes: number;
  ancho: number;
  alto: number;
  hashSha256: string;
}

export interface VisionEmbeddingResponse {
  mensaje: string;
  modelo: string;
  dispositivo: string;
  dimension: number;
  embedding: number[];
  archivo: VisionFileResponse;
  tiempoProcesamientoMs: number;
}
``