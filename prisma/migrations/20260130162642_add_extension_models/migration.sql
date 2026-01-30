-- CreateTable
CREATE TABLE "AnonymousDevice" (
    "id" TEXT NOT NULL,
    "deviceToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "AnonymousDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "deviceId" TEXT,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageVisit" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationSeconds" INTEGER,
    "userId" TEXT,
    "deviceId" TEXT,

    CONSTRAINT "PageVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AnonymousDevice_deviceToken_key" ON "AnonymousDevice"("deviceToken");

-- CreateIndex
CREATE INDEX "AnonymousDevice_deviceToken_idx" ON "AnonymousDevice"("deviceToken");

-- CreateIndex
CREATE INDEX "AnonymousDevice_userId_idx" ON "AnonymousDevice"("userId");

-- CreateIndex
CREATE INDEX "AnonymousDevice_expiresAt_idx" ON "AnonymousDevice"("expiresAt");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_deviceId_idx" ON "Bookmark"("deviceId");

-- CreateIndex
CREATE INDEX "Bookmark_url_idx" ON "Bookmark"("url");

-- CreateIndex
CREATE INDEX "PageVisit_userId_idx" ON "PageVisit"("userId");

-- CreateIndex
CREATE INDEX "PageVisit_deviceId_idx" ON "PageVisit"("deviceId");

-- CreateIndex
CREATE INDEX "PageVisit_visitedAt_idx" ON "PageVisit"("visitedAt");

-- CreateIndex
CREATE INDEX "PageVisit_url_idx" ON "PageVisit"("url");

-- AddForeignKey
ALTER TABLE "AnonymousDevice" ADD CONSTRAINT "AnonymousDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AnonymousDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageVisit" ADD CONSTRAINT "PageVisit_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "AnonymousDevice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
