-- CreateEnum
CREATE TYPE "payMethod" AS ENUM ('PAYPACK', 'IREMBOPAY', 'MTN');

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "paymentMethod" "payMethod" NOT NULL DEFAULT 'MTN';
