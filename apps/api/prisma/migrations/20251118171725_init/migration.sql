-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'emoji_dog',
    "elo" INTEGER NOT NULL DEFAULT 1000,
    "rankTier" TEXT NOT NULL DEFAULT 'bronze',
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "matchesLost" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "premiumStatus" BOOLEAN NOT NULL DEFAULT false,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "authToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "winnerId" TEXT,
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "player1AvgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "player2AvgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "player1FastestAnswer" INTEGER NOT NULL DEFAULT 0,
    "player2FastestAnswer" INTEGER NOT NULL DEFAULT 0,
    "player1Accuracy" INTEGER NOT NULL DEFAULT 0,
    "player2Accuracy" INTEGER NOT NULL DEFAULT 0,
    "player1EloBefore" INTEGER NOT NULL DEFAULT 0,
    "player1EloAfter" INTEGER NOT NULL DEFAULT 0,
    "player1EloChange" INTEGER NOT NULL DEFAULT 0,
    "player2EloBefore" INTEGER NOT NULL DEFAULT 0,
    "player2EloAfter" INTEGER NOT NULL DEFAULT 0,
    "player2EloChange" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPerformance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "matchesWon" INTEGER NOT NULL DEFAULT 0,
    "winRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avgResponseTime" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "wrongAnswer1" TEXT NOT NULL,
    "wrongAnswer2" TEXT NOT NULL,
    "wrongAnswer3" TEXT NOT NULL,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "lastUsed" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_authToken_key" ON "User"("authToken");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_elo_idx" ON "User"("elo");

-- CreateIndex
CREATE INDEX "User_authToken_idx" ON "User"("authToken");

-- CreateIndex
CREATE INDEX "Match_player1Id_idx" ON "Match"("player1Id");

-- CreateIndex
CREATE INDEX "Match_player2Id_idx" ON "Match"("player2Id");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Match_completedAt_idx" ON "Match"("completedAt");

-- CreateIndex
CREATE INDEX "CategoryPerformance_userId_idx" ON "CategoryPerformance"("userId");

-- CreateIndex
CREATE INDEX "CategoryPerformance_category_idx" ON "CategoryPerformance"("category");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPerformance_userId_category_key" ON "CategoryPerformance"("userId", "category");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_lastUsed_idx" ON "Question"("lastUsed");
