-- CreateTable
CREATE TABLE "Specification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "pimStore" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DataPsm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "store" TEXT NOT NULL,
    "specificationId" TEXT NOT NULL,
    CONSTRAINT "DataPsm_specificationId_fkey" FOREIGN KEY ("specificationId") REFERENCES "Specification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
