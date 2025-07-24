/*
  Warnings:

  - You are about to alter the column `status` on the `urls` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_urls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_team" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "qrCodeUrl" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campain" TEXT,
    "utm_term" TEXT,
    "utm_content" TEXT,
    "utm_id" INTEGER,
    "utm_product" TEXT,
    "updatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "urls_id_team_fkey" FOREIGN KEY ("id_team") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_urls" ("click_count", "code", "createdAt", "domain", "id", "id_team", "qrCodeUrl", "reference", "status", "updatedAt", "utm_campain", "utm_content", "utm_id", "utm_medium", "utm_product", "utm_source", "utm_term") SELECT "click_count", "code", "createdAt", "domain", "id", "id_team", "qrCodeUrl", "reference", "status", "updatedAt", "utm_campain", "utm_content", "utm_id", "utm_medium", "utm_product", "utm_source", "utm_term" FROM "urls";
DROP TABLE "urls";
ALTER TABLE "new_urls" RENAME TO "urls";
CREATE UNIQUE INDEX "urls_code_key" ON "urls"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
