import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SimpleGameProps {
  onGameEnd: (score: number) => void;
  gameId: string;
  title: string;
  description: string;
}

export function SimpleGame({ onGameEnd, gameId, title, description }: SimpleGameProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameStarted(true);
    setGameOver(false);
    setIsPlaying(true);
    
    // Game timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameStarted(false);
          setIsPlaying(false);
          onGameEnd(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClick = () => {
    if (isPlaying) {
      setScore(prev => prev + 1);
    }
  };

  const getGameEmoji = (id: string) => {
    const emojiMap: Record<string, string> = {
      'pacman': '👻',
      'breakout': '🧱',
      'space-invaders': '👾',
      'checkers': '🔴',
      'chess': '♟️',
      'connect-four': '🔵',
      'zombie-shooter': '🧟',
      'asteroid-field': '☄️',
      'platform-jumper': '🏃',
      'ninja-run': '🥷',
      'tower-defense': '🏰',
      'bike-racing': '🏍️',
      'boat-racing': '⛵',
      'airplane-racing': '✈️',
      'sliding-puzzle': '🧩',
      'word-search': '📝',
      'sudoku': '🔢',
      'jigsaw-puzzle': '🧩',
      'pinball': '🎯',
      'whack-a-mole': '🔨'
    };
    return emojiMap[id] || '🎮';
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-8 rounded-lg">
        <div className="text-8xl mb-4">{getGameEmoji(gameId)}</div>
        <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-6">{description}</p>
        
        {!gameStarted && !gameOver && (
          <div className="space-y-4">
            <p className="text-white">This is a simple demo version of {title}</p>
            <Button 
              onClick={startGame}
              className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold glow-animation"
            >
              Start {title}
            </Button>
          </div>
        )}

        {gameStarted && !gameOver && (
          <div className="space-y-4">
            <div 
              className="text-6xl animate-pulse cursor-pointer hover:scale-110 transition-transform"
              onClick={handleClick}
            >
              {getGameEmoji(gameId)}
            </div>
            <p className="text-2xl font-bold text-[var(--game-bright)]">Click to Score!</p>
            <p className="text-lg text-white">Score: <span className="text-[var(--game-success)]">{score}</span></p>
            <p className="text-lg text-white">Time: <span className="text-[var(--game-warning)]">{timeLeft}s</span></p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-[var(--game-warning)] h-2.5 rounded-full transition-all duration-1000" 
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-300">Click the {getGameEmoji(gameId)} to earn points!</p>
          </div>
        )}

        {gameOver && (
          <div className="space-y-4">
            <div className="text-6xl">🏆</div>
            <p className="text-2xl font-bold text-green-400">Game Complete!</p>
            <p className="text-lg text-white">Final Score: <span className="text-[var(--game-success)]">{score}</span></p>
            <Button 
              onClick={startGame}
              className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}