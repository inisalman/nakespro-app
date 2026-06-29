-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "referrer" TEXT,
    "title" TEXT,
    "screen" TEXT,
    "language" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrackingEvent_siteId_createdAt_idx" ON "TrackingEvent"("siteId", "createdAt");

-- CreateIndex
CREATE INDEX "TrackingEvent_siteId_idx" ON "TrackingEvent"("siteId");
