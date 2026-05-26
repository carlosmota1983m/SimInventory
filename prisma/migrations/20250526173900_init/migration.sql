-- CreateEnum
CREATE TYPE "SlotConfig" AS ENUM ('ONE_PHYSICAL', 'TWO_PHYSICAL', 'ONE_PHYS_ONE_ESIM', 'TWO_ESIM');

-- CreateEnum
CREATE TYPE "SimType" AS ENUM ('FISICA', 'ESIM');

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "configuracion_slots" "SlotConfig" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "dispositivo_id" TEXT NOT NULL,
    "plataforma" TEXT NOT NULL,
    "usuario_email" TEXT NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sims" (
    "id" TEXT NOT NULL,
    "tipo" "SimType" NOT NULL,
    "numero" TEXT NOT NULL,
    "compania" TEXT NOT NULL,
    "registro_gubernamental" BOOLEAN NOT NULL DEFAULT false,
    "ssid_iccid" TEXT,
    "pin" TEXT,
    "puk" TEXT,
    "fecha_ultima_recarga" TIMESTAMP(3),
    "dispositivo_id" TEXT,
    "imagen_qr" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "recovery_question" TEXT NOT NULL,
    "recovery_answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_dispositivo_id_fkey" FOREIGN KEY ("dispositivo_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sims" ADD CONSTRAINT "sims_dispositivo_id_fkey" FOREIGN KEY ("dispositivo_id") REFERENCES "devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
