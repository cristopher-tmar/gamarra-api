/*
  Warnings:

  - You are about to drop the column `color` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `imagen_url` on the `producto` table. All the data in the column will be lost.
  - You are about to drop the column `talla` on the `producto` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EstadoProcesamientoImagen" AS ENUM ('PENDIENTE', 'PROCESANDO', 'PROCESADA', 'ERROR');

-- AlterTable
ALTER TABLE "producto" DROP COLUMN "color",
DROP COLUMN "imagen_url",
DROP COLUMN "talla",
ADD COLUMN     "atributos" JSONB;

-- CreateTable
CREATE TABLE "producto_imagen" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "nombre_original" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "tamanio_bytes" INTEGER,
    "ancho" INTEGER,
    "alto" INTEGER,
    "hash_archivo" VARCHAR(64),
    "principal" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 1,
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "estado_procesamiento" "EstadoProcesamientoImagen" NOT NULL DEFAULT 'PENDIENTE',
    "modelo_embedding" VARCHAR(100),
    "fecha_procesamiento" TIMESTAMP(3),
    "mensaje_error" VARCHAR(500),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producto_imagen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "producto_imagen_producto_id_idx" ON "producto_imagen"("producto_id");

-- CreateIndex
CREATE INDEX "producto_imagen_estado_procesamiento_idx" ON "producto_imagen"("estado_procesamiento");

-- CreateIndex
CREATE UNIQUE INDEX "producto_imagen_producto_id_url_key" ON "producto_imagen"("producto_id", "url");

-- CreateIndex
CREATE INDEX "producto_categoria_idx" ON "producto"("categoria");

-- AddForeignKey
ALTER TABLE "producto_imagen" ADD CONSTRAINT "producto_imagen_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
