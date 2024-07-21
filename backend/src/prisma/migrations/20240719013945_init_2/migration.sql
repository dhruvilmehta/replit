/*
  Warnings:

  - You are about to drop the `repl` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "repl" DROP CONSTRAINT "repl_userId_fkey";

-- DropTable
DROP TABLE "repl";

-- CreateTable
CREATE TABLE "Repl" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Repl_id_key" ON "Repl"("id");

-- AddForeignKey
ALTER TABLE "Repl" ADD CONSTRAINT "Repl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
