-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "assigneeName" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "startDate" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL,
    "teams" TEXT NOT NULL DEFAULT '',
    "column" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "reporter" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assigneeName", "column", "createdAt", "description", "dueDate", "id", "order", "ownerId", "priority", "reporter", "startDate", "tags", "teams", "title", "updatedAt") SELECT "assigneeName", "column", "createdAt", "description", "dueDate", "id", "order", "ownerId", "priority", "reporter", "startDate", "tags", "teams", "title", "updatedAt" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_ownerId_column_idx" ON "Task"("ownerId", "column");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
