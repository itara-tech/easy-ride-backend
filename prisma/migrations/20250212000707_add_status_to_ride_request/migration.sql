-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_customer_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_driver_fkey";

-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_customer_fkey";

-- DropForeignKey
ALTER TABLE "OTP" DROP CONSTRAINT "OTP_driver_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "driverId" TEXT;

-- AlterTable
ALTER TABLE "OTP" ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "driverId" TEXT;

-- AlterTable
ALTER TABLE "RideRequest" ADD COLUMN     "status" "RideStatus" NOT NULL DEFAULT 'REQUESTED';

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customer_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_driver_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_customer_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_driver_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
