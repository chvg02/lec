/*
  Warnings:

  - Added the required column `name` to the `project_tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project_tags" ADD COLUMN     "name" TEXT NOT NULL;
