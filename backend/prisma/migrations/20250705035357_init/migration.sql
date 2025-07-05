/*
  Warnings:

  - A unique constraint covering the columns `[registerno]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `department` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registerno` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Dept" AS ENUM ('IT', 'CSE', 'AIDS', 'AIML', 'ECE', 'EEE', 'MECH');

-- CreateEnum
CREATE TYPE "Year" AS ENUM ('first_Year', 'second_Year', 'third_Year', 'fourth_Year');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "department" "Dept" NOT NULL,
ADD COLUMN     "registerno" TEXT NOT NULL,
ADD COLUMN     "year" "Year" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_registerno_key" ON "Student"("registerno");
