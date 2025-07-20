-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ShortenUrl" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subdomain" TEXT,
    "domain" TEXT NOT NULL,
    "path" TEXT,
    "hash" TEXT,
    "short" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "updatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,
    CONSTRAINT "ShortenUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ShortenUrl" ("active", "createdAt", "domain", "hash", "id", "path", "protocol", "short", "subdomain", "updatedAt", "userId") SELECT "active", "createdAt", "domain", "hash", "id", "path", "protocol", "short", "subdomain", "updatedAt", "userId" FROM "ShortenUrl";
DROP TABLE "ShortenUrl";
ALTER TABLE "new_ShortenUrl" RENAME TO "ShortenUrl";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
