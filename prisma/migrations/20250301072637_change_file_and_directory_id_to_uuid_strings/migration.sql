/*
  Warnings:

  - The primary key for the `Directory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `File` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Directory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "parent_id" TEXT,
    "project_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" DATETIME NOT NULL,
    CONSTRAINT "Directory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Directory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Directory_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Directory" ("created_at", "id", "last_modified", "parent_id", "path", "project_id") SELECT "created_at", "id", "last_modified", "parent_id", "path", "project_id" FROM "Directory";
DROP TABLE "Directory";
ALTER TABLE "new_Directory" RENAME TO "Directory";
CREATE UNIQUE INDEX "Directory_path_key" ON "Directory"("path");
CREATE INDEX "Directory_path_project_id_idx" ON "Directory"("path", "project_id");
CREATE TABLE "new_File" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "parent_id" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "project_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" DATETIME NOT NULL,
    CONSTRAINT "File_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Directory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "File_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_File" ("content", "created_at", "id", "last_modified", "parent_id", "path", "project_id") SELECT "content", "created_at", "id", "last_modified", "parent_id", "path", "project_id" FROM "File";
DROP TABLE "File";
ALTER TABLE "new_File" RENAME TO "File";
CREATE UNIQUE INDEX "File_path_key" ON "File"("path");
CREATE INDEX "File_path_project_id_idx" ON "File"("path", "project_id");
CREATE TABLE "new_Version" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "snapshot" TEXT NOT NULL,
    "committedBy" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Version_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Version" ("committedBy", "created_at", "file_id", "id", "snapshot") SELECT "committedBy", "created_at", "file_id", "id", "snapshot" FROM "Version";
DROP TABLE "Version";
ALTER TABLE "new_Version" RENAME TO "Version";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
