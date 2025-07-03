/*
  Warnings:

  - Added the required column `role` to the `TeamMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('LEADER', 'MEMBER');

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "role" "Role" NOT NULL;
