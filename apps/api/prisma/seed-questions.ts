import { PrismaClient } from '@prisma/client';
import { REAL_QUESTIONS } from './real-questions';
import { ALL_QUESTIONS } from './generate-questions';

const prisma = new PrismaClient();

/**
 * Seed database with initial questions
 */
async function seedQuestions() {
  console.log('Starting question seeding...');

  // Clear existing questions (optional, comment out if you want to preserve existing)
  const deleteCount = await prisma.question.deleteMany({});
  console.log(`Deleted ${deleteCount.count} existing questions`);

  // Combine curated questions with generated ones
  const questions = [...REAL_QUESTIONS, ...ALL_QUESTIONS];
  console.log(`Seeding ${questions.length} total questions (${REAL_QUESTIONS.length} curated + ${ALL_QUESTIONS.length} generated)`);

  // Batch insert for performance
  const batchSize = 50;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    await prisma.question.createMany({
      data: batch,
    });
    console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(questions.length / batchSize)}`);
  }

  // Verify counts
  const counts = await prisma.question.groupBy({
    by: ['category', 'difficulty'],
    _count: true,
  });

  console.log('\nQuestion distribution:');
  counts.forEach(({ category, difficulty, _count }) => {
    console.log(`  ${category} (${difficulty}): ${_count}`);
  });

  const total = await prisma.question.count();
  console.log(`\nTotal questions in database: ${total}`);
}

seedQuestions()
  .catch(error => {
    console.error('Error seeding questions:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
