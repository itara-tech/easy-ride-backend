/*
  Warnings:

  - A unique constraint covering the columns `[rideRequestId]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `rideRequestId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "rideRequestId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "isPriceAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isRegret" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priceOffer" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_rideRequestId_key" ON "ChatRoom"("rideRequestId");

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_rideRequestId_fkey" FOREIGN KEY ("rideRequestId") REFERENCES "RideRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
