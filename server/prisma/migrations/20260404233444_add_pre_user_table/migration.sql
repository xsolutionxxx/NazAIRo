/*
  Warnings:

  - You are about to drop the column `isActivated` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActivated";

-- CreateTable
CREATE TABLE "PreUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "activationLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreUser_email_key" ON "PreUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PreUser_phone_key" ON "PreUser"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "PreUser_activationLink_key" ON "PreUser"("activationLink");
