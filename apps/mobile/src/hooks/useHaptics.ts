import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

/**
 * Hook for haptic feedback with standardized patterns
 *
 * Usage:
 * ```tsx
 * const haptics = useHaptics();
 *
 * // Light impact for UI navigation
 * haptics.light();
 *
 * // Medium impact for selections/submissions
 * haptics.medium();
 *
 * // Heavy impact for important actions
 * haptics.heavy();
 *
 * // Success notification
 * haptics.success();
 *
 * // Error notification
 * haptics.error();
 *
 * // Warning notification
 * haptics.warning();
 * ```
 */
export function useHaptics() {
  /**
   * Light impact - for standard UI navigation/selection
   */
  const light = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail if haptics not supported
      console.log('[Haptics] Light impact failed:', error);
    }
  }, []);

  /**
   * Medium impact - for answer submission, button presses
   */
  const medium = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.log('[Haptics] Medium impact failed:', error);
    }
  }, []);

  /**
   * Heavy/Rigid impact - for wrong answers, critical actions
   */
  const heavy = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('[Haptics] Heavy impact failed:', error);
    }
  }, []);

  /**
   * Rigid impact - alias for heavy (for API compatibility)
   */
  const rigid = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.log('[Haptics] Rigid impact failed:', error);
    }
  }, []);

  /**
   * Success notification - for correct answers, achievements
   */
  const success = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.log('[Haptics] Success notification failed:', error);
    }
  }, []);

  /**
   * Error notification - for wrong answers, failures
   */
  const error = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.log('[Haptics] Error notification failed:', error);
    }
  }, []);

  /**
   * Warning notification - for low timer, caution states
   */
  const warning = useCallback(async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.log('[Haptics] Warning notification failed:', error);
    }
  }, []);

  /**
   * Selection changed - iOS-only selection feedback
   */
  const selection = useCallback(async () => {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.log('[Haptics] Selection feedback failed:', error);
    }
  }, []);

  return {
    light,
    medium,
    heavy,
    rigid,
    success,
    error,
    warning,
    selection,
  };
}
