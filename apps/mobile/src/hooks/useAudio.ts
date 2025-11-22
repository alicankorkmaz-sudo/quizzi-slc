import { useCallback, useEffect, useRef } from 'react';
import { audioService } from '../services/audioService';
import { SoundType, SoundConfig, AudioSettings, BGMType, BGMConfig } from '../types/audio';

/**
 * Hook for audio playback with low-latency sound effects
 *
 * Usage:
 * ```tsx
 * const { playSound, stopSound, updateSettings } = useAudio();
 *
 * // Simple usage
 * playSound(SoundType.BUTTON_TAP);
 *
 * // With config
 * playSound({
 *   type: SoundType.TIMER_TICK,
 *   volume: 0.5,
 *   loop: true,
 *   preventOverlap: true
 * });
 * ```
 */
export function useAudio() {
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Play a sound effect
   */
  const playSound = useCallback((config: SoundConfig | SoundType) => {
    if (!isMounted.current) return;
    audioService.playSound(config);
  }, []);

  /**
   * Stop a specific sound
   */
  const stopSound = useCallback((type: SoundType) => {
    if (!isMounted.current) return;
    audioService.stopSound(type);
  }, []);

  /**
   * Stop all sounds
   */
  const stopAllSounds = useCallback(() => {
    if (!isMounted.current) return;
    audioService.stopAllSounds();
  }, []);

  /**
   * Update audio settings
   */
  const updateSettings = useCallback((settings: Partial<AudioSettings>) => {
    audioService.updateSettings(settings);
  }, []);

  /**
   * Get current audio settings
   */
  const getSettings = useCallback((): AudioSettings => {
    return audioService.getSettings();
  }, []);

  /**
   * Play background music
   */
  const playBGM = useCallback((config: BGMConfig | BGMType) => {
    if (!isMounted.current) return;
    audioService.playBGM(config);
  }, []);

  /**
   * Stop background music
   */
  const stopBGM = useCallback((config?: { fadeOutDuration?: number }) => {
    if (!isMounted.current) return;
    audioService.stopBGM(config);
  }, []);

  /**
   * Set BGM playback rate (tempo/pitch)
   */
  const setBGMRate = useCallback((rate: number) => {
    if (!isMounted.current) return;
    audioService.setBGMRate(rate);
  }, []);

  return {
    playSound,
    stopSound,
    stopAllSounds,
    updateSettings,
    getSettings,
    playBGM,
    stopBGM,
    setBGMRate,
  };
}

/**
 * Convenience hook for button tap sounds
 * Returns a function that plays the button tap sound
 */
export function useButtonTap() {
  const { playSound } = useAudio();

  return useCallback(() => {
    playSound(SoundType.BUTTON_TAP);
  }, [playSound]);
}
