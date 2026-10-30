export function getHighScore(gameId: string): number {
  try {
    const val = localStorage.getItem(`highscore_${gameId}`);
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export function setHighScore(gameId: string, score: number): void {
  try {
    const current = getHighScore(gameId);
    if (score > current) {
      localStorage.setItem(`highscore_${gameId}`, String(score));
    }
  } catch {
    // localStorage unavailable
  }
}

export function getBestTime(gameId: string): number | null {
  try {
    const val = localStorage.getItem(`besttime_${gameId}`);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

export function setBestTime(gameId: string, time: number): void {
  try {
    const current = getBestTime(gameId);
    if (current === null || time < current) {
      localStorage.setItem(`besttime_${gameId}`, String(time));
    }
  } catch {
    // localStorage unavailable
  }
}
