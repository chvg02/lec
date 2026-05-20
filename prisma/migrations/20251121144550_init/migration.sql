/*
  Warnings:

  - The primary key for the `project_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `project_id` on the `project_tags` table. All the data in the column will be lost.
  - You are about to drop the column `tag_id` on the `project_tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "project_tags" DROP CONSTRAINT "project_tags_project_id_fkey";

-- DropForeignKey
ALTER TABLE "project_tags" DROP CONSTRAINT "project_tags_tag_id_fkey";

-- AlterTable
ALTER TABLE "project_tags" DROP CONSTRAINT "project_tags_pkey",
DROP COLUMN "project_id",
DROP COLUMN "tag_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "project_tags_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "_projectToproject_tags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_projectToproject_tags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_projectToproject_tags_B_index" ON "_projectToproject_tags"("B");

-- AddForeignKey
ALTER TABLE "_projectToproject_tags" ADD CONSTRAINT "_projectToproject_tags_A_fkey" FOREIGN KEY ("A") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_projectToproject_tags" ADD CONSTRAINT "_projectToproject_tags_B_fkey" FOREIGN KEY ("B") REFERENCES "project_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
