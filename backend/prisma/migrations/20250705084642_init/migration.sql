/*
  Warnings:

  - You are about to drop the column `date` on the `Competition` table. All the data in the column will be lost.
  - Added the required column `category` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enddate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priority` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prize_pool` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startdate` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_size` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Made the column `about` on table `Competition` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('REGISTRATION_OPEN', 'UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "date",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "enddate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "priority" "Priority" NOT NULL,
ADD COLUMN     "prize_pool" INTEGER NOT NULL,
ADD COLUMN     "startdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL,
ADD COLUMN     "team_size" INTEGER NOT NULL,
ALTER COLUMN "about" SET NOT NULL;
