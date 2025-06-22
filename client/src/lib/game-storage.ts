import { GameScore } from './game-types';

export class GameStorage {
  private static STORAGE_KEY = 'gameHighScores';
  private static SOUND_KEY = 'soundEnabled';
  private static DARK_MODE_KEY = 'darkMode';

  static getHighScores(): Record<string, number> {
    try {
      const scores = localStorage.getItem(this.STORAGE_KEY);
      return scores ? JSON.parse(scores) : {};
    } catch {
      return {};
    }
  }

  static saveHighScore(game: string, score: number): boolean {
    try {
      const scores = this.getHighScores();
      const isNewRecord = !scores[game] || score > scores[game];
      
      if (isNewRecord) {
        scores[game] = score;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scores));
      }
      
      return isNewRecord;
    } catch {
      return false;
    }
  }

  static getSoundEnabled(): boolean {
    try {
      const sound = localStorage.getItem(this.SOUND_KEY);
      return sound ? JSON.parse(sound) : true;
    } catch {
      return true;
    }
  }

  static setSoundEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(this.SOUND_KEY, JSON.stringify(enabled));
    } catch {
      // Ignore storage errors
    }
  }

  static getDarkMode(): boolean {
    try {
      const darkMode = localStorage.getItem(this.DARK_MODE_KEY);
      return darkMode ? JSON.parse(darkMode) : true;
    } catch {
      return true;
    }
  }

  static setDarkMode(enabled: boolean): void {
    try {
      localStorage.setItem(this.DARK_MODE_KEY, JSON.stringify(enabled));
    } catch {
      // Ignore storage errors
    }
  }
}
