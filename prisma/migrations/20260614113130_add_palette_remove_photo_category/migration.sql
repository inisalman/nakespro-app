/*
  Warnings:

  - You are about to drop the column `category` on the `OrderPhoto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "palette" TEXT;

-- AlterTable
ALTER TABLE "OrderPhoto" DROP COLUMN "category";
