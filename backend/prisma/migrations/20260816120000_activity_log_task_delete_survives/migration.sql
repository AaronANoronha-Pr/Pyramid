-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT,
    "projectId" TEXT,
    "taskTitle" TEXT NOT NULL DEFAULT '',
    "ownerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "field" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ActivityLog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ActivityLog" ("id", "taskId", "ownerId", "authorId", "kind", "field", "message", "createdAt")
SELECT "id", "taskId", "ownerId", "authorId", "kind", "field", "message", "createdAt" FROM "ActivityLog";
UPDATE "new_ActivityLog" SET
  "projectId" = (SELECT "Task"."projectId" FROM "Task" WHERE "Task"."id" = "new_ActivityLog"."taskId"),
  "taskTitle" = COALESCE((SELECT "Task"."title" FROM "Task" WHERE "Task"."id" = "new_ActivityLog"."taskId"), '');
DROP TABLE "ActivityLog";
ALTER TABLE "new_ActivityLog" RENAME TO "ActivityLog";
CREATE INDEX "ActivityLog_taskId_idx" ON "ActivityLog"("taskId");
CREATE INDEX "ActivityLog_projectId_idx" ON "ActivityLog"("projectId");
PRAGMA foreign_keys=ON;
