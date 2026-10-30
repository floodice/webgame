import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * 空闲提示 hook — 用户一段时间无操作后触发提示
 *
 * @param delayMs 空闲多久后显示提示（毫秒），默认 8000
 * @param enabled 是否启用（游戏结束/暂停时应传 false）
 * @returns { showHint, resetHint, hintCount }
 *   - showHint: 是否应显示提示
 *   - resetHint: 手动重置（用户交互时调用）
 *   - hintCount: 已触发提示次数（用于区分首次/多次提示的视觉效果）
 */
export function useIdleHint(delayMs = 8000, enabled = true) {
  const [showHint, setShowHint] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (!enabled) return;
    timerRef.current = setTimeout(() => {
      setShowHint(true);
      setHintCount(c => c + 1);
    }, delayMs);
  }, [clearTimer, delayMs, enabled]);

  const resetHint = useCallback(() => {
    setShowHint(false);
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (enabled) {
      startTimer();
    } else {
      clearTimer();
      setShowHint(false);
    }
    return clearTimer;
  }, [enabled, startTimer, clearTimer]);

  return { showHint, resetHint, hintCount };
}
