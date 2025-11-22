import { Audio, AVPlaybackStatus } from 'expo-av';
import { SoundType, SoundConfig, AudioSettings } from '../types/audio';

/**
 * Audio Service for low-latency sound effect playback
 *
 * Handles:
 * - Preloading sounds for instant playback
 * - Sound pooling to prevent loading delays
 * - Volume management
 * - Overlap prevention
 */

class AudioService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private playingStatus: Map<SoundType, boolean> = new Map();

  private settings: AudioSettings = {
    sfxEnabled: true,
    sfxVolume: 1.0,
    bgmEnabled: true,
    bgmVolume: 0.7,
  };

  // Map sound types to asset files
  // TODO: Add actual sound files to assets/sounds/
  private soundAssets: Record<SoundType, any> = {
    [SoundType.BUTTON_TAP]: require('../../assets/sounds/button-tap.mp3'),
    [SoundType.ANSWER_CORRECT]: require('../../assets/sounds/answer-correct.mp3'),
    [SoundType.ANSWER_WRONG]: require('../../assets/sounds/answer-wrong.mp3'),
    [SoundType.TIMER_TICK]: require('../../assets/sounds/timer-tick.mp3'),
    [SoundType.SCORE_COUNT]: require('../../assets/sounds/score-count.mp3'),
  };

  /**
   * Initialize audio mode and preload all sounds
   */
  async initialize(): Promise<void> {
    try {
      // Configure audio mode for low-latency playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Preload all sounds
      await this.preloadSounds();
    } catch (error) {
      console.error('[AudioService] Initialization failed:', error);
    }
  }

  /**
   * Preload all sound effects for instant playback
   */
  private async preloadSounds(): Promise<void> {
    const loadPromises = Object.entries(this.soundAssets).map(
      async ([type, asset]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(
            asset,
            { shouldPlay: false },
            this.onPlaybackStatusUpdate(type as SoundType)
          );
          this.sounds.set(type as SoundType, sound);
        } catch (error) {
          console.error(`[AudioService] Failed to load sound: ${type}`, error);
        }
      }
    );

    await Promise.all(loadPromises);
    console.log('[AudioService] Preloaded sounds:', this.sounds.size);
  }

  /**
   * Playback status callback to track playing state
   */
  private onPlaybackStatusUpdate(type: SoundType) {
    return (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        this.playingStatus.set(type, status.isPlaying);
      }
    };
  }

  /**
   * Play a sound effect with optional configuration
   */
  async playSound(config: SoundConfig | SoundType): Promise<void> {
    if (!this.settings.sfxEnabled) return;

    const soundConfig: SoundConfig =
      typeof config === 'string' ? { type: config } : config;

    const { type, volume = 1.0, loop = false, preventOverlap = false } = soundConfig;

    try {
      const sound = this.sounds.get(type);
      if (!sound) {
        console.warn(`[AudioService] Sound not loaded: ${type}`);
        return;
      }

      // Check overlap prevention
      const isPlaying = this.playingStatus.get(type);
      if (preventOverlap && isPlaying) {
        return;
      }

      // Set volume (combine config volume with global SFX volume)
      const finalVolume = volume * this.settings.sfxVolume;
      await sound.setVolumeAsync(finalVolume);

      // Set looping
      await sound.setIsLoopingAsync(loop);

      // Replay from start
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      console.error(`[AudioService] Failed to play sound: ${type}`, error);
    }
  }

  /**
   * Stop a specific sound
   */
  async stopSound(type: SoundType): Promise<void> {
    try {
      const sound = this.sounds.get(type);
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.error(`[AudioService] Failed to stop sound: ${type}`, error);
    }
  }

  /**
   * Stop all sounds
   */
  async stopAllSounds(): Promise<void> {
    const stopPromises = Array.from(this.sounds.values()).map((sound) =>
      sound.stopAsync().catch(() => {})
    );
    await Promise.all(stopPromises);
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current audio settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Cleanup and unload all sounds
   */
  async cleanup(): Promise<void> {
    const unloadPromises = Array.from(this.sounds.values()).map((sound) =>
      sound.unloadAsync().catch(() => {})
    );
    await Promise.all(unloadPromises);
    this.sounds.clear();
    this.playingStatus.clear();
  }
}

// Singleton instance
export const audioService = new AudioService();
