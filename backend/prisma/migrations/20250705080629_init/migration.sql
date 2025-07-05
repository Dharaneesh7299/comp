/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "Achivements" TEXT NOT NULL DEFAULT 'Provide It',
ADD COLUMN     "Address" TEXT NOT NULL DEFAULT 'Provide It',
ADD COLUMN     "bio" TEXT NOT NULL DEFAULT 'Provide It',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT 'Provide It',
ADD COLUMN     "skills" TEXT NOT NULL DEFAULT 'Provide It';

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "Student"("phone");
