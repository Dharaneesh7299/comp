/*
  Warnings:

  - You are about to drop the column `pasword` on the `Hod` table. All the data in the column will be lost.
  - You are about to drop the column `email_id` on the `Teacher` table. All the data in the column will be lost.
  - You are about to drop the column `members` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the `_StudentCompetitions` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `Teacher` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Hod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Teacher` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_StudentCompetitions" DROP CONSTRAINT "_StudentCompetitions_A_fkey";

-- DropForeignKey
ALTER TABLE "_StudentCompetitions" DROP CONSTRAINT "_StudentCompetitions_B_fkey";

-- DropIndex
DROP INDEX "Teacher_email_id_key";

-- AlterTable
ALTER TABLE "Hod" DROP COLUMN "pasword",
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" DROP COLUMN "email_id",
ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "members";

-- DropTable
DROP TABLE "_StudentCompetitions";

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_studentId_teamId_key" ON "TeamMember"("studentId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_email_key" ON "Teacher"("email");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
