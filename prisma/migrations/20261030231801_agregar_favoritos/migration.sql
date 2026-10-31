-- CreateTable
CREATE TABLE "favorito" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorito_usuario_id_idx" ON "favorito"("usuario_id");

-- CreateIndex
CREATE INDEX "favorito_producto_id_idx" ON "favorito"("producto_id");

-- CreateIndex
CREATE INDEX "favorito_fecha_creacion_idx" ON "favorito"("fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "favorito_usuario_id_producto_id_key" ON "favorito"("usuario_id", "producto_id");

-- AddForeignKey
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorito" ADD CONSTRAINT "favorito_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
