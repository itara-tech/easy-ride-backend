/*
  Warnings:

  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userType` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `customerId` on the `PasswordReset` table. All the data in the column will be lost.
  - You are about to drop the column `driverId` on the `PasswordReset` table. All the data in the column will be lost.
  - Added the required column `userId` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_customerId_fkey";

-- DropForeignKey
ALTER TABLE "PasswordReset" DROP CONSTRAINT "PasswordReset_driverId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "userId",
DROP COLUMN "userType";

-- AlterTable
ALTER TABLE "PasswordReset" DROP COLUMN "customerId",
DROP COLUMN "driverId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- RenameForeignKey
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_customerId_fkey" TO "Notification_customer_fkey";

-- RenameForeignKey
ALTER TABLE "Notification" RENAME CONSTRAINT "Notification_driverId_fkey" TO "Notification_driver_fkey";

-- RenameForeignKey
ALTER TABLE "OTP" RENAME CONSTRAINT "OTP_customerId_fkey" TO "OTP_customer_fkey";

-- RenameForeignKey
ALTER TABLE "OTP" RENAME CONSTRAINT "OTP_driverId_fkey" TO "OTP_driver_fkey";

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_customer_fkey" FOREIGN KEY ("userId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_driver_fkey" FOREIGN KEY ("userId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
