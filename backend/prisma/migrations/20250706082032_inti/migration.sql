/*
  Warnings:

  - The values [MEMBER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `motive` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Tstatus" AS ENUM ('REGISTERED', 'SHORTLISTED', 'REJECTED', 'WON');

-- CreateEnum
CREATE TYPE "Experience" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('LEADER', 'DEVELOPER');
ALTER TABLE "TeamMember" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
COMMIT;

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "certifacte" TEXT,
ADD COLUMN     "experience_level" "Experience" NOT NULL DEFAULT 'BEGINNER',
ADD COLUMN     "motive" TEXT NOT NULL,
ADD COLUMN     "status" "Tstatus" NOT NULL DEFAULT 'REGISTERED';
