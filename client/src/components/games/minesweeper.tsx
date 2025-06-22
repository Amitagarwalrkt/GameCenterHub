import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MinesweeperProps {
  onGameEnd: (score: number) => void;
}

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isExploded?: boolean;
}

export function Minesweeper({ onGameEnd }: MinesweeperProps) {
  const ROWS = 5;
  const COLS = 5;
  const MINES = 5;

  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagsUsed, setFlagsUsed] = useState(0);
  const [timer, setTimer] = useState(0);
  const [firstClick, setFirstClick] = useState(true);
  const [revealedCount, setRevealedCount] = useState(0);
  const [explodedMine, setExplodedMine] = useState<{row: number, col: number} | null>(null);

  const initializeBoard = useCallback((avoidRow?: number, avoidCol?: number) => {
    // Create empty board
    const newBoard: Cell[][] = Array(ROWS).fill(null).map(() =>
      Array(COLS).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        isExploded: false,
      }))
    );

    // Place mines randomly, avoiding first click area
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      
      // Avoid placing mine on first click or adjacent cells
      const isAvoidArea = avoidRow !== undefined && avoidCol !== undefined &&
        Math.abs(row - avoidRow) <= 1 && Math.abs(col - avoidCol) <= 1;
      
      if (!newBoard[row][col].isMine && !isAvoidArea) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbor mine counts
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (!newBoard[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 && newRow < ROWS &&
                newCol >= 0 && newCol < COLS &&
                newBoard[newRow][newCol].isMine
              ) {
                count++;
              }
            }
          }
          newBoard[row][col].neighborMines = count;
        }
      }
    }

    return newBoard;
  }, []);

  const startGame = useCallback(() => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setFlagsUsed(0);
    setTimer(0);
    setFirstClick(true);
    setRevealedCount(0);
    setExplodedMine(null);
  }, [initializeBoard]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameOver && !gameWon) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, gameWon]);

  const revealCell = (row: number, col: number) => {
    if (gameOver || gameWon || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    let newBoard = [...board.map(row => [...row])];

    // Handle first click - regenerate board if mine hit
    if (firstClick) {
      if (newBoard[row][col].isMine) {
        newBoard = initializeBoard(row, col);
      }
      setFirstClick(false);
    }

    newBoard[row][col].isRevealed = true;

    if (newBoard[row][col].isMine) {
      // Game over - reveal all mines with explosion effect
      newBoard[row][col].isExploded = true;
      setExplodedMine({ row, col });
      
      setTimeout(() => {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            if (newBoard[r][c].isMine) {
              newBoard[r][c].isRevealed = true;
            }
          }
        }
        setBoard(newBoard);
        setGameOver(true);
        onGameEnd(0);
      }, 500);
    } else {
      // Auto-reveal empty cells
      const revealed = new Set<string>();
      const toReveal = [[row, col]];

      while (toReveal.length > 0) {
        const [r, c] = toReveal.pop()!;
        const key = `${r},${c}`;
        
        if (revealed.has(key)) continue;
        revealed.add(key);

        if (newBoard[r][c].neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = r + dr;
              const newCol = c + dc;
              if (
                newRow >= 0 && newRow < ROWS &&
                newCol >= 0 && newCol < COLS &&
                !newBoard[newRow][newCol].isRevealed &&
                !newBoard[newRow][newCol].isFlagged &&
                !newBoard[newRow][newCol].isMine
              ) {
                newBoard[newRow][newCol].isRevealed = true;
                toReveal.push([newRow, newCol]);
              }
            }
          }
        }
      }

      // Check win condition
      let revealedCount = 0;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (newBoard[r][c].isRevealed && !newBoard[r][c].isMine) {
            revealedCount++;
          }
        }
      }

      setRevealedCount(revealedCount);

      if (revealedCount === ROWS * COLS - MINES) {
        setGameWon(true);
        const bonusPoints = Math.max(500 - timer * 2, 100);
        const flagBonus = (MINES - flagsUsed) * 10;
        const finalScore = bonusPoints + flagBonus;
        setTimeout(() => onGameEnd(finalScore), 1000);
      }
    }

    setBoard(newBoard);
  };

  const toggleFlag = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameOver || gameWon || board[row][col].isRevealed) return;

    const newBoard = [...board];
    if (newBoard[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setFlagsUsed(prev => prev - 1);
    } else if (flagsUsed < MINES) {
      newBoard[row][col].isFlagged = true;
      setFlagsUsed(prev => prev + 1);
    }
    setBoard(newBoard);
  };

  const getCellContent = (cell: Cell, row: number, col: number) => {
    if (cell.isFlagged) return '🚩';
    if (!cell.isRevealed) return '';
    if (cell.isMine) {
      if (cell.isExploded) return '💥';
      return '💣';
    }
    return cell.neighborMines > 0 ? cell.neighborMines.toString() : '';
  };

  const getCellStyle = (cell: Cell, row: number, col: number) => {
    const baseStyle = 'w-8 h-8 text-sm font-bold border border-gray-400 transition-all duration-200 transform';
    
    if (cell.isFlagged) {
      return `${baseStyle} bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg hover:scale-105`;
    }
    
    if (!cell.isRevealed) {
      return `${baseStyle} bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-400 hover:to-gray-600 text-white shadow-md hover:scale-105 cursor-pointer`;
    }
    
    if (cell.isMine) {
      if (cell.isExploded) {
        return `${baseStyle} bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg animate-pulse scale-110`;
      }
      return `${baseStyle} bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg`;
    }
    
    if (cell.neighborMines > 0) {
      const colors = [
        '', 
        'text-blue-700 bg-gradient-to-br from-blue-50 to-blue-100', 
        'text-green-700 bg-gradient-to-br from-green-50 to-green-100', 
        'text-red-700 bg-gradient-to-br from-red-50 to-red-100', 
        'text-purple-700 bg-gradient-to-br from-purple-50 to-purple-100', 
        'text-yellow-700 bg-gradient-to-br from-yellow-50 to-yellow-100', 
        'text-pink-700 bg-gradient-to-br from-pink-50 to-pink-100', 
        'text-gray-800 bg-gradient-to-br from-gray-50 to-gray-100', 
        'text-indigo-700 bg-gradient-to-br from-indigo-50 to-indigo-100'
      ];
      return `${baseStyle} ${colors[cell.neighborMines]} shadow-sm`;
    }
    
    return `${baseStyle} bg-gradient-to-br from-gray-100 to-gray-200 shadow-sm`;
  };

  if (!gameStarted) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Minesweeper</h3>
          <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg mb-4">
            <p className="text-gray-300 mb-2">Find all safe cells without hitting mines</p>
            <p className="text-gray-300 mb-2">Right-click to flag suspected mines</p>
            <p className="text-gray-300">First click is always safe</p>
          </div>
          <div className="flex justify-center gap-4 mb-6 text-sm">
            <div className="bg-[var(--game-blue)]/30 px-3 py-2 rounded">
              <span className="text-white">Grid: {ROWS}×{COLS}</span>
            </div>
            <div className="bg-[var(--game-warning)]/30 px-3 py-2 rounded">
              <span className="text-white">Mines: {MINES}</span>
            </div>
          </div>
          <Button 
            onClick={startGame}
            className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold glow-animation"
          >
            Start Minesweeper
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <div className="mb-6 flex justify-center gap-4">
          <div className="bg-[var(--game-blue)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg text-white">Time: <span className="font-bold text-[var(--game-bright)]">{timer}s</span></p>
          </div>
          <div className="bg-[var(--game-warning)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg text-white">Flags: <span className="font-bold text-[var(--game-bright)]">{flagsUsed}/{MINES}</span></p>
          </div>
          <div className="bg-[var(--game-success)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg text-white">Safe: <span className="font-bold text-[var(--game-bright)]">{revealedCount}/{ROWS * COLS - MINES}</span></p>
          </div>
        </div>

        <div className={`grid gap-1 max-w-2xl mx-auto mb-6 p-4 bg-[var(--game-darker)]/50 rounded-lg`} style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => revealCell(rowIndex, colIndex)}
                onContextMenu={(e) => toggleFlag(e, rowIndex, colIndex)}
                className={getCellStyle(cell, rowIndex, colIndex)}
                disabled={gameOver && !gameWon}
              >
                {getCellContent(cell, rowIndex, colIndex)}
              </button>
            ))
          )}
        </div>
      </div>

      {gameOver && !gameWon && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">💥</div>
            <p className="text-red-400 font-bold text-xl mb-2">BOOM! Game Over!</p>
            <p className="text-white mb-4">You stepped on a mine! The minefield got the better of you this time.</p>
            <div className="bg-red-600/20 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">Time survived: {timer} seconds</p>
              <p className="text-red-200 text-sm">Cells revealed: {revealedCount}/{ROWS * COLS - MINES}</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={startGame}
              className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold glow-animation"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-bold"
            >
              Exit Game
            </Button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-green-400 font-bold text-xl mb-2">Victory! Minefield Cleared!</p>
            <p className="text-white mb-4">Excellent work! You successfully navigated the minefield without hitting any mines.</p>
            <div className="bg-green-600/20 rounded-lg p-3 mb-4">
              <p className="text-green-200 text-sm">Completion time: {timer} seconds</p>
              <p className="text-green-200 text-sm">Perfect clear: {ROWS * COLS - MINES}/{ROWS * COLS - MINES} safe cells</p>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={startGame}
              className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold glow-animation"
            >
              Play Again
            </Button>
            <Button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-bold"
            >
              Exit Game
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={startGame}
        className="px-6 py-3 bg-[var(--game-blue)] hover:bg-[var(--game-bright)] rounded-lg text-white font-bold glow-animation"
      >
        New Game
      </Button>
    </div>
  );
}