/**
 * Avatar utilities for emoji avatar system (Story 10.1)
 */

// Available emoji avatars (must match backend)
export const AVAILABLE_AVATARS = [
  // Animals
  'emoji_dog',      // 🐶
  'emoji_cat',      // 🐱
  'emoji_panda',    // 🐼
  'emoji_fox',      // 🦊
  // Energy
  'emoji_lightning', // ⚡
  'emoji_fire',     // 🔥
  'emoji_diamond',  // 💎
  'emoji_target',   // 🎯
  // Faces
  'emoji_cool',     // 😎
  'emoji_nerd',     // 🤓
  'emoji_party',    // 🥳
  'emoji_devil',    // 😈
  // Fun
  'emoji_star',     // 🌟
  'emoji_rainbow',  // 🌈
  'emoji_pizza',    // 🍕
  'emoji_game',     // 🎮
] as const;

export type AvatarId = typeof AVAILABLE_AVATARS[number];

// Map avatar IDs to actual emoji
export const AVATAR_EMOJI_MAP: Record<AvatarId, string> = {
  // Animals
  emoji_dog: '🐶',
  emoji_cat: '🐱',
  emoji_panda: '🐼',
  emoji_fox: '🦊',
  // Energy
  emoji_lightning: '⚡',
  emoji_fire: '🔥',
  emoji_diamond: '💎',
  emoji_target: '🎯',
  // Faces
  emoji_cool: '😎',
  emoji_nerd: '🤓',
  emoji_party: '🥳',
  emoji_devil: '😈',
  // Fun
  emoji_star: '🌟',
  emoji_rainbow: '🌈',
  emoji_pizza: '🍕',
  emoji_game: '🎮',
};

/**
 * Get emoji string from avatar ID
 */
export function getAvatarEmoji(avatarId: string): string {
  const emoji = AVATAR_EMOJI_MAP[avatarId as AvatarId];
  if (!emoji) {
    console.warn('[getAvatarEmoji] Unknown avatar ID, using default dog:', avatarId);
    return '🐶'; // default to dog
  }
  return emoji;
}

/**
 * Get all avatars organized by category for UI display
 */
export interface AvatarCategory {
  category: string;
  avatars: Array<{ id: AvatarId; emoji: string }>;
}

export function getAvatarsByCategory(): AvatarCategory[] {
  return [
    {
      category: 'Animals',
      avatars: [
        { id: 'emoji_dog', emoji: '🐶' },
        { id: 'emoji_cat', emoji: '🐱' },
        { id: 'emoji_panda', emoji: '🐼' },
        { id: 'emoji_fox', emoji: '🦊' },
      ],
    },
    {
      category: 'Energy',
      avatars: [
        { id: 'emoji_lightning', emoji: '⚡' },
        { id: 'emoji_fire', emoji: '🔥' },
        { id: 'emoji_diamond', emoji: '💎' },
        { id: 'emoji_target', emoji: '🎯' },
      ],
    },
    {
      category: 'Faces',
      avatars: [
        { id: 'emoji_cool', emoji: '😎' },
        { id: 'emoji_nerd', emoji: '🤓' },
        { id: 'emoji_party', emoji: '🥳' },
        { id: 'emoji_devil', emoji: '😈' },
      ],
    },
    {
      category: 'Fun',
      avatars: [
        { id: 'emoji_star', emoji: '🌟' },
        { id: 'emoji_rainbow', emoji: '🌈' },
        { id: 'emoji_pizza', emoji: '🍕' },
        { id: 'emoji_game', emoji: '🎮' },
      ],
    },
  ];
}
