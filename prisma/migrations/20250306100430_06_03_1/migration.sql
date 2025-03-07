/*
  Warnings:

  - You are about to drop the column `userId` on the `PasswordReset` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_customer_fkey";

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_driver_fkey";

-- AlterTable
ALTER TABLE "PasswordReset" DROP COLUMN "userId",
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "driverId" TEXT;

-- RenameForeignKey
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_customer_fkey" TO "Notification_customerId_fkey";

-- RenameForeignKey
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_driver_fkey" TO "Notification_driverId_fkey";

-- RenameForeignKey
ALTER TABLE "OTP" RENAME CONSTRAINT "OTP_customer_fkey" TO "OTP_customerId_fkey";

-- RenameForeignKey
ALTER TABLE "OTP" RENAME CONSTRAINT "OTP_driver_fkey" TO "OTP_driverId_fkey";

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
