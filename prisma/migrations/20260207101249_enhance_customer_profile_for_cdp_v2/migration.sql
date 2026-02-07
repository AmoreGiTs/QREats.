/*
  Warnings:

  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "restaurantId" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "visitsCount" INTEGER NOT NULL DEFAULT 0,
    "averageOrderValue" DECIMAL NOT NULL DEFAULT 0,
    "lifetimeValue" DECIMAL NOT NULL DEFAULT 0,
    "churnRisk" REAL,
    "segment" TEXT,
    "preferences" TEXT,
    "tags" TEXT,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT true,
    "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false,
    "preferencesUpdatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "birthDate" DATETIME,
    "lastVisitAt" DATETIME,
    CONSTRAINT "Customer_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("birthDate", "createdAt", "email", "id", "lastVisitAt", "loyaltyPoints", "name", "phone", "preferences", "restaurantId", "visitsCount") SELECT "birthDate", "createdAt", "email", "id", "lastVisitAt", "loyaltyPoints", "name", "phone", "preferences", "restaurantId", "visitsCount" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE INDEX "Customer_restaurantId_lifetimeValue_idx" ON "Customer"("restaurantId", "lifetimeValue");
CREATE INDEX "Customer_restaurantId_segment_idx" ON "Customer"("restaurantId", "segment");
CREATE UNIQUE INDEX "Customer_restaurantId_phone_key" ON "Customer"("restaurantId", "phone");
CREATE UNIQUE INDEX "Customer_restaurantId_email_key" ON "Customer"("restaurantId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
