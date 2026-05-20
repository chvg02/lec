/*
  Warnings:

  - Added the required column `content` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news" ADD COLUMN     "content" TEXT NOT NULL;
