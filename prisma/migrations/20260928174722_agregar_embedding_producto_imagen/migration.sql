-- Habilitar la extensión pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Agregar el embedding visual de CLIP
ALTER TABLE "producto_imagen"
ADD COLUMN "embedding" vector(512);