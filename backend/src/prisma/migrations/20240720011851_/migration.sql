-- DropForeignKey
ALTER TABLE "Repl" DROP CONSTRAINT "Repl_userId_fkey";

-- AddForeignKey
ALTER TABLE "Repl" ADD CONSTRAINT "Repl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("name") ON DELETE SET NULL ON UPDATE CASCADE;
