-- CreateTable
CREATE TABLE "sesion_refresh" (
    "id" UUID NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "fecha_revocacion" TIMESTAMP(3),
    "user_agent" VARCHAR(500),
    "direccion_ip" VARCHAR(64),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_modificacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sesion_refresh_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sesion_refresh_usuario_id_idx" ON "sesion_refresh"("usuario_id");

-- CreateIndex
CREATE INDEX "sesion_refresh_fecha_expiracion_idx" ON "sesion_refresh"("fecha_expiracion");

-- CreateIndex
CREATE INDEX "sesion_refresh_fecha_revocacion_idx" ON "sesion_refresh"("fecha_revocacion");

-- AddForeignKey
ALTER TABLE "sesion_refresh" ADD CONSTRAINT "sesion_refresh_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
