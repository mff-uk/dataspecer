/*
  Warnings:

  - You are about to drop the column `name` on the `DataSpecification` table. All the data in the column will be lost.
  - You are about to drop the column `pimStore` on the `DataSpecification` table. All the data in the column will be lost.
  - You are about to drop the column `DataSpecificationId` on the `DataStructure` table. All the data in the column will be lost.
  - You are about to drop the column `artifact_json` on the `DataStructure` table. All the data in the column will be lost.
  - You are about to drop the column `artifact_xml` on the `DataStructure` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `DataStructure` table. All the data in the column will be lost.
  - You are about to drop the column `store` on the `DataStructure` table. All the data in the column will be lost.
  - Added the required column `pimSchema` to the `DataSpecification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `DataSpecification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `psmSchema` to the `DataStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `DataStructure` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DataSpecification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pimSchema" TEXT NOT NULL,
    "storeId" TEXT NOT NULL
);
INSERT INTO "new_DataSpecification" ("id") SELECT "id" FROM "DataSpecification";
DROP TABLE "DataSpecification";
ALTER TABLE "new_DataSpecification" RENAME TO "DataSpecification";
CREATE UNIQUE INDEX "DataSpecification_pimSchema_key" ON "DataSpecification"("pimSchema");
CREATE UNIQUE INDEX "DataSpecification_storeId_key" ON "DataSpecification"("storeId");
CREATE TABLE "new_DataStructure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storeId" TEXT NOT NULL,
    "psmSchema" TEXT NOT NULL,
    "belongsToDataSpecificationId" TEXT,
    CONSTRAINT "DataStructure_belongsToDataSpecificationId_fkey" FOREIGN KEY ("belongsToDataSpecificationId") REFERENCES "DataSpecification" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DataStructure" ("id") SELECT "id" FROM "DataStructure";
DROP TABLE "DataStructure";
ALTER TABLE "new_DataStructure" RENAME TO "DataStructure";
CREATE UNIQUE INDEX "DataStructure_psmSchema_key" ON "DataStructure"("psmSchema");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
