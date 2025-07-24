/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ShortenUrl` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UrlUtm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Post";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ShortenUrl";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UrlUtm";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "plan" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "users_on_teams" (
    "userId" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "teamId"),
    CONSTRAINT "users_on_teams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_on_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "id_author" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "urls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_team" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
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

-- CreateTable
CREATE TABLE "url_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "id_url" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "url_history_id_url_fkey" FOREIGN KEY ("id_url") REFERENCES "urls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UrlTags" (
    "id_url" INTEGER NOT NULL,
    "id_tag" TEXT NOT NULL,

    PRIMARY KEY ("id_url", "id_tag"),
    CONSTRAINT "UrlTags_id_url_fkey" FOREIGN KEY ("id_url") REFERENCES "urls" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UrlTags_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "Tag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "urls_code_key" ON "urls"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");
