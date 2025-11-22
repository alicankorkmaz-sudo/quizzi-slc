/**
 * Audio type definitions for game sound effects
 */

export enum SoundType {
  // UI Interactions
  BUTTON_TAP = 'button-tap',

  // Answer Feedback
  ANSWER_CORRECT = 'answer-correct',
  ANSWER_WRONG = 'answer-wrong',

  // Timer
  TIMER_TICK = 'timer-tick',

  // Score
  SCORE_COUNT = 'score-count',
}

export interface SoundConfig {
  type: SoundType;
  volume?: number; // 0.0 to 1.0
  loop?: boolean;
  preventOverlap?: boolean; // Prevent playing same sound while already playing
}

export interface AudioSettings {
  sfxEnabled: boolean;
  sfxVolume: number; // 0.0 to 1.0
  bgmEnabled: boolean;
  bgmVolume: number; // 0.0 to 1.0
}
