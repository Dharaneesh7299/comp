-- CreateEnum
CREATE TYPE "Delstatus" AS ENUM ('ONLINE', 'OFFLINE');

-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "del_status" "Delstatus" NOT NULL DEFAULT 'ONLINE';
