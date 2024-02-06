/*
  Warnings:

  - Made the column `dateOfBirth` on table `Author` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Author" ALTER COLUMN "dateOfBirth" SET NOT NULL;

-- AlterTable
ALTER TABLE "BookInstance" ALTER COLUMN "dueBack" DROP NOT NULL;
