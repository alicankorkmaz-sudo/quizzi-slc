import { Audio, AVPlaybackStatus } from 'expo-av';
import { SoundType, SoundConfig, AudioSettings, BGMType, BGMConfig } from '../types/audio';

/**
 * Audio Service for low-latency sound effect playback and background music
 *
 * Handles:
 * - Preloading sounds for instant playback
 * - Sound pooling to prevent loading delays
 * - Volume management
 * - Overlap prevention
 * - Background music with fade in/out
 * - Dynamic tempo/pitch control for BGM
 */

class AudioService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private playingStatus: Map<SoundType, boolean> = new Map();

  // Background music
  private bgm: Map<BGMType, Audio.Sound> = new Map();
  private currentBGM: BGMType | null = null;
  private bgmFadeInterval: NodeJS.Timeout | null = null;

  private settings: AudioSettings = {
    sfxEnabled: true,
    sfxVolume: 1.0,
    bgmEnabled: true,
    bgmVolume: 0.7,
  };

  // Map sound types to asset files
  private soundAssets: Record<SoundType, any> = {
    [SoundType.BUTTON_TAP]: require('../../assets/sounds/button-tap.wav'),
    [SoundType.ANSWER_CORRECT]: require('../../assets/sounds/answer-correct.wav'),
    [SoundType.ANSWER_WRONG]: require('../../assets/sounds/answer-wrong.mp3'),
    [SoundType.TIMER_TICK]: require('../../assets/sounds/timer-tick.wav'),
    [SoundType.SCORE_COUNT]: require('../../assets/sounds/score-count.wav'),
  };

  // Map BGM types to asset files
  private bgmAssets: Record<BGMType, any> = {
    [BGMType.BATTLE]: require('../../assets/sounds/battle-bgm.mp3'),
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

      // Preload all sounds and BGM
      await Promise.all([this.preloadSounds(), this.preloadBGM()]);
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
      sound.stopAsync().catch(() => { })
    );
    await Promise.all(stopPromises);
  }

  /**
   * Preload all background music tracks
   */
  private async preloadBGM(): Promise<void> {
    const loadPromises = Object.entries(this.bgmAssets).map(
      async ([type, asset]) => {
        try {
          const { sound } = await Audio.Sound.createAsync(asset, {
            shouldPlay: false,
            isLooping: true,
            volume: 0, // Start at 0 for fade-in
          });
          this.bgm.set(type as BGMType, sound);
        } catch (error) {
          console.error(`[AudioService] Failed to load BGM: ${type}`, error);
        }
      }
    );

    await Promise.all(loadPromises);
    console.log('[AudioService] Preloaded BGM tracks:', this.bgm.size);
  }

  /**
   * Play background music with optional fade-in
   */
  async playBGM(config: BGMConfig | BGMType): Promise<void> {
    if (!this.settings.bgmEnabled) return;

    const bgmConfig: BGMConfig =
      typeof config === 'string' ? { type: config } : config;

    const { type, volume = 1.0, fadeInDuration = 1000 } = bgmConfig;

    try {
      const sound = this.bgm.get(type);
      if (!sound) {
        console.warn(`[AudioService] BGM not loaded: ${type}`);
        return;
      }

      // Stop current BGM if playing
      if (this.currentBGM && this.currentBGM !== type) {
        await this.stopBGM({ fadeOutDuration: 500 });
      }

      this.currentBGM = type;

      // Start from beginning
      await sound.setPositionAsync(0);

      // Start playing at volume 0
      await sound.setVolumeAsync(0);
      await sound.playAsync();

      // Fade in
      const targetVolume = volume * this.settings.bgmVolume;
      await this.fadeBGM(sound, 0, targetVolume, fadeInDuration);
    } catch (error) {
      console.error(`[AudioService] Failed to play BGM: ${type}`, error);
    }
  }

  /**
   * Stop background music with optional fade-out
   */
  async stopBGM(config?: { fadeOutDuration?: number }): Promise<void> {
    const { fadeOutDuration = 1000 } = config || {};

    if (!this.currentBGM) return;

    try {
      const sound = this.bgm.get(this.currentBGM);
      if (!sound) return;

      const status = await sound.getStatusAsync();
      if (!status.isLoaded || !status.isPlaying) {
        this.currentBGM = null;
        return;
      }

      // Fade out
      await this.fadeBGM(sound, status.volume || 0, 0, fadeOutDuration);

      // Stop playback
      await sound.stopAsync();
      this.currentBGM = null;
    } catch (error) {
      console.error('[AudioService] Failed to stop BGM:', error);
    }
  }

  /**
   * Adjust BGM tempo/pitch (for critical moments)
   * @param rate Playback rate (0.5 = half speed, 2.0 = double speed)
   * Typical range: 1.0 (normal) to 1.2 (intense)
   */
  async setBGMRate(rate: number): Promise<void> {
    if (!this.currentBGM) return;

    try {
      const sound = this.bgm.get(this.currentBGM);
      if (!sound) return;

      await sound.setRateAsync(rate, true); // true = correct pitch
    } catch (error) {
      console.error('[AudioService] Failed to set BGM rate:', error);
    }
  }

  /**
   * Fade BGM volume over time
   */
  private async fadeBGM(
    sound: Audio.Sound,
    fromVolume: number,
    toVolume: number,
    duration: number
  ): Promise<void> {
    // Clear any existing fade
    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval);
      this.bgmFadeInterval = null;
    }

    const steps = 20; // Number of volume steps
    const stepDuration = duration / steps;
    const volumeStep = (toVolume - fromVolume) / steps;

    let currentStep = 0;

    return new Promise((resolve) => {
      this.bgmFadeInterval = setInterval(async () => {
        currentStep++;
        const newVolume = fromVolume + volumeStep * currentStep;

        try {
          await sound.setVolumeAsync(Math.max(0, Math.min(1, newVolume)));
        } catch (error) {
          console.error('[AudioService] Fade error:', error);
        }

        if (currentStep >= steps) {
          if (this.bgmFadeInterval) {
            clearInterval(this.bgmFadeInterval);
            this.bgmFadeInterval = null;
          }
          resolve();
        }
      }, stepDuration);
    });
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
    // Clear fade interval
    if (this.bgmFadeInterval) {
      clearInterval(this.bgmFadeInterval);
      this.bgmFadeInterval = null;
    }

    // Unload SFX
    const sfxUnloadPromises = Array.from(this.sounds.values()).map((sound) =>
      sound.unloadAsync().catch(() => { })
    );

    // Unload BGM
    const bgmUnloadPromises = Array.from(this.bgm.values()).map((sound) =>
      sound.unloadAsync().catch(() => { })
    );

    await Promise.all([...sfxUnloadPromises, ...bgmUnloadPromises]);

    this.sounds.clear();
    this.playingStatus.clear();
    this.bgm.clear();
    this.currentBGM = null;
  }
}

// Singleton instance
export const audioService = new AudioService();
