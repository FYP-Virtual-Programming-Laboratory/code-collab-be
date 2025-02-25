/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `created_by_id` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `ProjectMembership` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `ProjectMembership` table. All the data in the column will be lost.
  - You are about to drop the column `committed_by_id` on the `Version` table. All the data in the column will be lost.
  - Added the required column `created_by` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user` to the `ProjectMembership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `committedBy` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "User_username_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "y_doc_updates" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_Project" ("created_at", "id", "name", "session_id", "y_doc_updates") SELECT "created_at", "id", "name", "session_id", "y_doc_updates" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_session_id_key" ON "Project"("session_id");
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
CREATE TABLE "new_ProjectMembership" (
    "user" TEXT NOT NULL,
    "project_id" INTEGER NOT NULL,

    PRIMARY KEY ("user", "project_id"),
    CONSTRAINT "ProjectMembership_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProjectMembership" ("project_id") SELECT "project_id" FROM "ProjectMembership";
DROP TABLE "ProjectMembership";
ALTER TABLE "new_ProjectMembership" RENAME TO "ProjectMembership";
CREATE TABLE "new_Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshot" TEXT NOT NULL,
    "committedBy" TEXT NOT NULL,
    "file_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Version_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Version" ("created_at", "file_id", "id", "snapshot") SELECT "created_at", "file_id", "id", "snapshot" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
