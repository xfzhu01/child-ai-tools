-- AlterTable
ALTER TABLE "TypingSession" ADD COLUMN "levelNumber" INTEGER;

-- CreateTable
CREATE TABLE "ModeProgress" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "mode" "GameMode" NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "maxUnlocked" INTEGER NOT NULL DEFAULT 1,
    "itemIndex" INTEGER NOT NULL DEFAULT 0,
    "levelStars" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModeProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModeProgress_childId_idx" ON "ModeProgress"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "ModeProgress_childId_mode_key" ON "ModeProgress"("childId", "mode");

-- AddForeignKey
ALTER TABLE "ModeProgress" ADD CONSTRAINT "ModeProgress_childId_fkey" FOREIGN KEY ("childId") REFERENCES "ChildProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
