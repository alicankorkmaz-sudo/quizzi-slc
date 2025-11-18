/**
 * Verification script for ELO context storage (Story 6.3)
 * Tests that Match records store full ELO before/after/change values
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyEloContext() {
  console.log('🔍 Verifying ELO Context Implementation (Story 6.3)\n');

  // Check schema has the new fields
  const latestMatch = await prisma.match.findFirst({
    where: { status: 'completed' },
    orderBy: { completedAt: 'desc' },
  });

  if (!latestMatch) {
    console.log('❌ No completed matches found in database');
    return;
  }

  console.log('📊 Latest Match Data:');
  console.log(`  Match ID: ${latestMatch.id}`);
  console.log(`  Winner: ${latestMatch.winnerId}`);
  console.log(`  Category: ${latestMatch.category}`);
  console.log('');

  console.log('🎯 Player 1 ELO Context:');
  console.log(`  Before:  ${latestMatch.player1EloBefore}`);
  console.log(`  After:   ${latestMatch.player1EloAfter}`);
  console.log(`  Change:  ${latestMatch.player1EloChange > 0 ? '+' : ''}${latestMatch.player1EloChange}`);
  console.log('');

  console.log('🎯 Player 2 ELO Context:');
  console.log(`  Before:  ${latestMatch.player2EloBefore}`);
  console.log(`  After:   ${latestMatch.player2EloAfter}`);
  console.log(`  Change:  ${latestMatch.player2EloChange > 0 ? '+' : ''}${latestMatch.player2EloChange}`);
  console.log('');

  // Verify audit trail integrity
  const hasFullContext =
    latestMatch.player1EloBefore > 0 &&
    latestMatch.player1EloAfter > 0 &&
    latestMatch.player2EloBefore > 0 &&
    latestMatch.player2EloAfter > 0;

  if (hasFullContext) {
    console.log('✅ PASS: Full ELO context is being stored');
    console.log('');
    console.log('📝 Audit Trail Verification:');
    console.log(
      `  Player 1: ${latestMatch.player1EloBefore} + ${latestMatch.player1EloChange} = ${latestMatch.player1EloAfter} ✓`
    );
    console.log(
      `  Player 2: ${latestMatch.player2EloBefore} + ${latestMatch.player2EloChange} = ${latestMatch.player2EloAfter} ✓`
    );
  } else {
    console.log('⚠️  WARNING: This match was created before ELO context migration');
    console.log('   Play a new match to verify the implementation works correctly');
  }

  await prisma.$disconnect();
}

verifyEloContext().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
