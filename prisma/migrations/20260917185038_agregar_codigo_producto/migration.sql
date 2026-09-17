/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `producto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `producto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "producto" ADD COLUMN     "codigo" VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "producto_codigo_key" ON "producto"("codigo");
