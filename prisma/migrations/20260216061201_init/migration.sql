-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "renters" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "nationalId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "moveInYear" INTEGER NOT NULL,
    "moveInMonth" INTEGER NOT NULL,
    "moveInDay" INTEGER NOT NULL,
    "moveOutYear" INTEGER,
    "moveOutMonth" INTEGER,
    "moveOutDay" INTEGER,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "renters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "renterId" TEXT,
    "year" INTEGER NOT NULL,
    "monthIndex" INTEGER NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "renters_nationalId_key" ON "renters"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "rent_payments_roomId_year_monthIndex_key" ON "rent_payments"("roomId", "year", "monthIndex");

-- AddForeignKey
ALTER TABLE "renters" ADD CONSTRAINT "renters_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_renterId_fkey" FOREIGN KEY ("renterId") REFERENCES "renters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
