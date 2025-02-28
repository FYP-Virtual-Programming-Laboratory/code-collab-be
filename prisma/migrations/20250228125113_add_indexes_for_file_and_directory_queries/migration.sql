-- CreateIndex
CREATE INDEX "Directory_path_project_id_idx" ON "Directory"("path", "project_id");

-- CreateIndex
CREATE INDEX "File_path_project_id_idx" ON "File"("path", "project_id");
