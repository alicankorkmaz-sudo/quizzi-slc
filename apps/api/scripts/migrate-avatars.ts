/**
 * Migration script to update existing users from old avatar system to emoji avatars
 * Assigns random emoji avatars to users who have old default_* or premium_* avatars
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const EMOJI_AVATARS = [
  'emoji_dog',
  'emoji_cat',
  'emoji_panda',
  'emoji_fox',
  'emoji_lightning',
  'emoji_fire',
  'emoji_diamond',
  'emoji_target',
  'emoji_cool',
  'emoji_nerd',
  'emoji_party',
  'emoji_devil',
  'emoji_star',
  'emoji_rainbow',
  'emoji_pizza',
  'emoji_game',
];

async function migrateAvatars() {
  console.log('Starting avatar migration...');

  // Find all users with old avatar format
  const usersToUpdate = await prisma.user.findMany({
    where: {
      OR: [
        { avatar: { startsWith: 'default_' } },
        { avatar: { startsWith: 'premium_' } },
      ],
    },
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  });

  console.log(`Found ${usersToUpdate.length} users to migrate`);

  let updated = 0;
  for (const user of usersToUpdate) {
    // Assign random emoji avatar
    const randomAvatar = EMOJI_AVATARS[Math.floor(Math.random() * EMOJI_AVATARS.length)];

    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: randomAvatar },
    });

    console.log(`Updated ${user.username}: ${user.avatar} -> ${randomAvatar}`);
    updated++;
  }

  console.log(`\nMigration complete! Updated ${updated} users.`);
}

migrateAvatars()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
