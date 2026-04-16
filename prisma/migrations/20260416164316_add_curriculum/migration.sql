/*
  Warnings:

  - Made the column `instructions` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Exercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `unit` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `goal` on table `Lesson` required. This step will fail if there are existing NULL values in that column.
  - Made the column `content` on table `Story` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `Story` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageStyle` on table `Story` required. This step will fail if there are existing NULL values in that column.
  - Made the column `debateStory` on table `Story` required. This step will fail if there are existing NULL values in that column.
  - Made the column `debateMoral` on table `Story` required. This step will fail if there are existing NULL values in that column.
  - Made the column `debatePersonal` on table `Story` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Canvas" DROP CONSTRAINT "Canvas_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "ExampleSentence" DROP CONSTRAINT "ExampleSentence_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Exercise" DROP CONSTRAINT "Exercise_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Vocab" DROP CONSTRAINT "Vocab_lessonId_fkey";

-- AlterTable
ALTER TABLE "Canvas" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "ExampleSentence" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "instructions" SET NOT NULL,
ALTER COLUMN "instructions" SET DEFAULT '',
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Lesson" ALTER COLUMN "language" SET DEFAULT 'English',
ALTER COLUMN "level" SET DEFAULT 'A2',
ALTER COLUMN "unit" SET NOT NULL,
ALTER COLUMN "unit" SET DEFAULT '',
ALTER COLUMN "goal" SET NOT NULL,
ALTER COLUMN "goal" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "content" SET NOT NULL,
ALTER COLUMN "content" SET DEFAULT '',
ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "imageUrl" SET DEFAULT '',
ALTER COLUMN "imageStyle" SET NOT NULL,
ALTER COLUMN "imageStyle" SET DEFAULT '',
ALTER COLUMN "debateStory" SET NOT NULL,
ALTER COLUMN "debateStory" SET DEFAULT '',
ALTER COLUMN "debateMoral" SET NOT NULL,
ALTER COLUMN "debateMoral" SET DEFAULT '',
ALTER COLUMN "debatePersonal" SET NOT NULL,
ALTER COLUMN "debatePersonal" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Vocab" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "subject" TEXT NOT NULL DEFAULT 'languages',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CurriculumLesson" (
    "id" TEXT NOT NULL,
    "curriculumId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CurriculumLesson_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vocab" ADD CONSTRAINT "Vocab_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExampleSentence" ADD CONSTRAINT "ExampleSentence_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Canvas" ADD CONSTRAINT "Canvas_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Curriculum" ADD CONSTRAINT "Curriculum_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumLesson" ADD CONSTRAINT "CurriculumLesson_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurriculumLesson" ADD CONSTRAINT "CurriculumLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
