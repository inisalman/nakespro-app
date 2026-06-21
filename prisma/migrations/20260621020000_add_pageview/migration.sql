-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "visitorHash" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "referrer" TEXT,
    "userAgent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_orderId_createdAt_idx" ON "PageView"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "PageView_orderId_visitorHash_createdAt_idx" ON "PageView"("orderId", "visitorHash", "createdAt");

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
