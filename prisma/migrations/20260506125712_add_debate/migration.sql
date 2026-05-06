-- CreateTable
CREATE TABLE "Debate" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "topic" TEXT NOT NULL DEFAULT '',
    "article" TEXT NOT NULL DEFAULT '',
    "keyTerms" JSONB NOT NULL DEFAULT '[]',
    "questions" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Debate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Debate_lessonId_key" ON "Debate"("lessonId");

-- AddForeignKey
ALTER TABLE "Debate" ADD CONSTRAINT "Debate_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
