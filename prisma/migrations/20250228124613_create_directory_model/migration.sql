/*
  Warnings:

  - You are about to drop the column `is_dir` on the `File` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Directory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "parent_id" INTEGER,
    "project_id" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_modified" DATETIME NOT NULL,
    CONSTRAINT "Directory_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Directory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Directory_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "parent_id" INTEGER,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Directory_path_key" ON "Directory"("path");
