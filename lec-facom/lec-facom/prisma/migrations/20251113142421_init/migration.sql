/*
  Warnings:

  - The values [editor,registered_user] on the enum `user_role_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "user_role_type_new" AS ENUM ('admin', 'user');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role_type_new" USING ("role"::text::"user_role_type_new");
ALTER TYPE "user_role_type" RENAME TO "user_role_type_old";
ALTER TYPE "user_role_type_new" RENAME TO "user_role_type";
DROP TYPE "public"."user_role_type_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin';
COMMIT;

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ALTER COLUMN "role" SET DEFAULT 'admin';
