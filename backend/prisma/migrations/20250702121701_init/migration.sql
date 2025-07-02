-- CreateTable
CREATE TABLE "HOD" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "pasword" TEXT NOT NULL,

    CONSTRAINT "HOD_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HOD_name_key" ON "HOD"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HOD_pasword_key" ON "HOD"("pasword");
