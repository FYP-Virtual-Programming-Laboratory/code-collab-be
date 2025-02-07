-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Project" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" INTEGER NOT NULL,
    "y_doc_updates" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Project_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Project" ("created_at", "created_by_id", "id", "name", "session_id") SELECT "created_at", "created_by_id", "id", "name", "session_id" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_session_id_key" ON "Project"("session_id");
CREATE UNIQUE INDEX "Project_name_key" ON "Project"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
