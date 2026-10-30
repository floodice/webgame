import { useState, useCallback } from 'react';
import { getHighScore, setHighScore } from '../utils/storage';

export function useGameScore(gameId: string) {
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState(() => getHighScore(gameId));

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
    const currentHigh = getHighScore(gameId);
    if (newScore > currentHigh) {
      setHighScore(gameId, newScore);
      setHighScoreState(newScore);
    }
  }, [gameId]);

  const addScore = useCallback((points: number) => {
    setScore(prev => {
      const newScore = prev + points;
      const currentHigh = getHighScore(gameId);
      if (newScore > currentHigh) {
        setHighScore(gameId, newScore);
        setHighScoreState(newScore);
      }
      return newScore;
    });
  }, [gameId]);

  const resetScore = useCallback(() => {
    setScore(0);
  }, []);

  return { score, highScore, updateScore, addScore, resetScore };
}
