-- CreateEnum
CREATE TYPE "TipoEventoComportamiento" AS ENUM ('PRODUCTO_VISTO', 'FAVORITO_AGREGADO', 'FAVORITO_ELIMINADO', 'BUSQUEDA_TEXTO', 'BUSQUEDA_VISUAL', 'RESULTADO_SELECCIONADO');

-- CreateTable
CREATE TABLE "evento_comportamiento" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoEventoComportamiento" NOT NULL,
    "usuario_id" INTEGER,
    "producto_id" INTEGER,
    "session_id" VARCHAR(100) NOT NULL,
    "termino_busqueda" VARCHAR(200),
    "metadata" JSONB,
    "fecha_evento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evento_comportamiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evento_comportamiento_tipo_idx" ON "evento_comportamiento"("tipo");

-- CreateIndex
CREATE INDEX "evento_comportamiento_usuario_id_idx" ON "evento_comportamiento"("usuario_id");

-- CreateIndex
CREATE INDEX "evento_comportamiento_producto_id_idx" ON "evento_comportamiento"("producto_id");

-- CreateIndex
CREATE INDEX "evento_comportamiento_session_id_idx" ON "evento_comportamiento"("session_id");

-- CreateIndex
CREATE INDEX "evento_comportamiento_fecha_evento_idx" ON "evento_comportamiento"("fecha_evento");

-- CreateIndex
CREATE INDEX "evento_comportamiento_tipo_fecha_evento_idx" ON "evento_comportamiento"("tipo", "fecha_evento");

-- CreateIndex
CREATE INDEX "evento_comportamiento_producto_id_fecha_evento_idx" ON "evento_comportamiento"("producto_id", "fecha_evento");

-- CreateIndex
CREATE INDEX "evento_comportamiento_usuario_id_fecha_evento_idx" ON "evento_comportamiento"("usuario_id", "fecha_evento");

-- AddForeignKey
ALTER TABLE "evento_comportamiento" ADD CONSTRAINT "evento_comportamiento_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_comportamiento" ADD CONSTRAINT "evento_comportamiento_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
