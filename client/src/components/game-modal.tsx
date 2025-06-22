import { useState } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SnakeGame } from './games/snake-game';
import { TicTacToe } from './games/tic-tac-toe';
import { MemoryGame } from './games/memory-game';
import { CarRacing } from './games/car-racing';
import { ShootingGame } from './games/shooting-game';
import { Minesweeper } from './games/minesweeper';
import { SpinningWheel } from './games/spinning-wheel';
import { Tetris } from './games/tetris';
import { Pong } from './games/pong';
import { BubbleShooter } from './games/bubble-shooter';
import { SimpleGame } from './games/simple-game';
import { GAMES } from '@/lib/game-types';

interface GameModalProps {
  gameId: string;
  onClose: () => void;
  onUpdateHighScore: (game: string, score: number) => void;
}

export function GameModal({ gameId, onClose, onUpdateHighScore }: GameModalProps) {
  const [gameKey, setGameKey] = useState(0);
  
  const game = GAMES.find(g => g.id === gameId);
  
  const restartGame = () => {
    setGameKey(prev => prev + 1);
  };

  const renderGame = () => {
    const gameProps = {
      onGameEnd: (score: number) => onUpdateHighScore(gameId, score),
    };

    switch (gameId) {
      case 'snake':
        return <SnakeGame key={gameKey} {...gameProps} />;
      case 'tictactoe':
        return <TicTacToe key={gameKey} {...gameProps} />;
      case 'memory':
        return <MemoryGame key={gameKey} {...gameProps} />;
      case 'racing':
        return <CarRacing key={gameKey} {...gameProps} />;
      case 'shooting':
        return <ShootingGame key={gameKey} {...gameProps} />;
      case 'minesweeper':
        return <Minesweeper key={gameKey} {...gameProps} />;
      case 'wheel':
        return <SpinningWheel key={gameKey} {...gameProps} />;
      case 'tetris':
        return <Tetris key={gameKey} {...gameProps} />;
      case 'pong':
        return <Pong key={gameKey} {...gameProps} />;
      case 'bubble-shooter':
        return <BubbleShooter key={gameKey} {...gameProps} />;
      default:
        // For all other games, show a simple demo game
        return (
          <SimpleGame 
            key={gameKey} 
            {...gameProps} 
            gameId={gameId}
            title={game?.title || gameId}
            description={game?.description || 'A fun game to play!'}
          />
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-[var(--game-darker)] border-[var(--game-blue)]/30">
        <DialogHeader className="flex flex-row justify-between items-center space-y-0 pb-4 border-b border-[var(--game-blue)]/30">
          <DialogTitle className="text-xl font-bold text-white">
            {game?.title || 'Game'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {game?.description || 'Interactive game interface with restart and exit controls'}
          </DialogDescription>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={restartGame}
              className="bg-[var(--game-warning)] hover:bg-[var(--game-warning)]/80 text-white border-[var(--game-warning)]"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="bg-[var(--game-error)] hover:bg-[var(--game-error)]/80 text-white border-[var(--game-error)]"
            >
              <X className="w-4 h-4 mr-2" />
              Exit
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-4 text-center overflow-auto">
          {renderGame()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
