/*
  Warnings:

  - Added the required column `tienda_id` to the `producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "tienda_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "tienda" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" VARCHAR(500),
    "galeria" VARCHAR(150) NOT NULL,
    "piso" VARCHAR(20),
    "numero_local" VARCHAR(30) NOT NULL,
    "telefono" VARCHAR(20),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tienda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tienda_codigo_key" ON "tienda"("codigo");

-- CreateIndex
CREATE INDEX "producto_tienda_id_idx" ON "producto"("tienda_id");

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_tienda_id_fkey" FOREIGN KEY ("tienda_id") REFERENCES "tienda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
