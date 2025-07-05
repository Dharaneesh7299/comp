/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bio` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `department` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institution` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `office` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `professional_experience` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qualifications` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialization` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Position" AS ENUM ('PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'HOD');

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "bio" TEXT NOT NULL,
ADD COLUMN     "department" "Dept" NOT NULL,
ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "office" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "position" "Position" NOT NULL,
ADD COLUMN     "professional_experience" TEXT NOT NULL,
ADD COLUMN     "qualifications" TEXT NOT NULL,
ADD COLUMN     "specialization" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_phone_key" ON "Teacher"("phone");
