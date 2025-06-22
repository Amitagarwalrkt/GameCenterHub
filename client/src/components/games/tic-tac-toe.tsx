import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface TicTacToeProps {
  onGameEnd: (score: number) => void;
}

export function TicTacToe({ onGameEnd }: TicTacToeProps) {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameActive, setGameActive] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (newBoard: string[]) => {
    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        return newBoard[a];
      }
    }
    return null;
  };

  const makeMove = (index: number) => {
    if (board[index] !== '' || !gameActive) return;
    
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameActive(false);
      onGameEnd(gameWinner === 'X' ? 100 : 50); // X wins = 100 points, O wins = 50
      return;
    }
    
    if (newBoard.every(cell => cell !== '')) {
      setWinner('Draw');
      setGameActive(false);
      onGameEnd(25); // Draw = 25 points
      return;
    }
    
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setCurrentPlayer('X');
    setGameActive(true);
    setWinner(null);
  };

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-white">Tic Tac Toe</h3>
        <div className="mb-6">
          {gameActive ? (
            <div className="bg-[var(--game-blue)]/30 p-3 rounded-lg">
              <p className="text-lg text-white">
                Player <span className="font-bold text-[var(--game-bright)] text-xl">{currentPlayer}</span>'s turn
              </p>
            </div>
          ) : (
            <div className={`p-3 rounded-lg border ${winner === 'Draw' ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-green-500/20 border-green-500/50'}`}>
              <p className="text-lg font-bold text-white">
                {winner === 'Draw' ? "🤝 It's a draw!" : `🎉 Player ${winner} wins!`}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6 p-4 bg-[var(--game-darker)]/50 rounded-lg">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => makeMove(index)}
              className={`w-20 h-20 text-3xl font-bold rounded-lg transition-all duration-200 border-2 shadow-lg
                ${cell === 'X' ? 'text-[var(--game-success)] bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500 shadow-green-500/20' : 
                  cell === 'O' ? 'text-[var(--game-error)] bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500 shadow-red-500/20' : 
                  'bg-gradient-to-br from-[var(--game-blue)] to-[var(--game-bright)] hover:from-[var(--game-bright)] hover:to-[var(--game-purple)] text-white border-[var(--game-bright)] hover:scale-105'}
                border-[var(--game-bright)]`}
              disabled={!gameActive}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={resetGame}
        className="px-6 py-3 bg-[var(--game-blue)] hover:bg-[var(--game-bright)] rounded-lg text-white font-bold glow-animation"
      >
        🎮 New Game
      </Button>
    </div>
  );
}
