import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface TetrisProps {
  onGameEnd: (score: number) => void;
}

export function Tetris({ onGameEnd }: TetrisProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const BOARD_WIDTH = 10;
  const BOARD_HEIGHT = 20;
  const CELL_SIZE = 25;

  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  interface Piece {
    shape: number[][];
    color: string;
    x: number;
    y: number;
  }
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);

  const tetrominoes = [
    { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
    { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
    { shape: [[0,1,0],[1,1,1]], color: '#a000f0' }, // T
    { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, // S
    { shape: [[1,1,0],[0,1,1]], color: '#f00000' }, // Z
    { shape: [[1,0,0],[1,1,1]], color: '#f0a000' }, // J
    { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }, // L
  ];

  const createPiece = useCallback(() => {
    const piece = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
    return {
      shape: piece.shape,
      color: piece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
      y: 0
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (board[y][x]) {
          ctx.fillStyle = '#666';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
      }
    }

    // Draw current piece
    if (currentPiece) {
      ctx.fillStyle = currentPiece.color;
      currentPiece.shape.forEach((row: number[], dy: number) => {
        row.forEach((value: number, dx: number) => {
          if (value) {
            ctx.fillRect(
              (currentPiece.x + dx) * CELL_SIZE,
              (currentPiece.y + dy) * CELL_SIZE,
              CELL_SIZE - 1,
              CELL_SIZE - 1
            );
          }
        });
      });
    }

    // Draw grid
    ctx.strokeStyle = '#333';
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }, [board, currentPiece]);

  const canMove = useCallback((piece: any, dx: number, dy: number) => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x + dx;
          const newY = piece.y + y + dy;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }
          if (newY >= 0 && board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }, [board]);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row: number[], dy: number) => {
      row.forEach((value: number, dx: number) => {
        if (value) {
          const y = currentPiece.y + dy;
          const x = currentPiece.x + dx;
          if (y >= 0) {
            newBoard[y][x] = 1;
          }
        }
      });
    });

    // Clear completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++; // Check the same line again
      }
    }

    setBoard(newBoard);
    setLines(prev => prev + linesCleared);
    setScore(prev => prev + linesCleared * 100 * level);
    
    // Check game over
    if (currentPiece.y <= 1) {
      setGameRunning(false);
      setGameOver(true);
      onGameEnd(score);
      return;
    }

    setCurrentPiece(createPiece());
  }, [board, currentPiece, level, setBoard, setLines, setScore, setGameRunning, setGameOver, onGameEnd, score, createPiece]);

  const gameLoop = useCallback(() => {
    if (!gameRunning || !currentPiece) return;

    if (canMove(currentPiece, 0, 1)) {
      setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : prev);
    } else {
      placePiece();
    }
  }, [gameRunning, currentPiece, canMove, placePiece]);

  const startGame = useCallback(() => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setCurrentPiece(createPiece());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameRunning(true);
    setGameOver(false);
  }, [createPiece]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning || !currentPiece) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (canMove(currentPiece, -1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x - 1 } : prev);
          }
          break;
        case 'ArrowRight':
          if (canMove(currentPiece, 1, 0)) {
            setCurrentPiece(prev => prev ? { ...prev, x: prev.x + 1 } : prev);
          }
          break;
        case 'ArrowDown':
          if (canMove(currentPiece, 0, 1)) {
            setCurrentPiece(prev => prev ? { ...prev, y: prev.y + 1 } : prev);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, currentPiece, canMove]);

  useEffect(() => {
    if (gameRunning && currentPiece) {
      gameLoopRef.current = window.setInterval(gameLoop, 1000 - (level * 100));
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameRunning, gameLoop, level, currentPiece]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          width={BOARD_WIDTH * CELL_SIZE}
          height={BOARD_HEIGHT * CELL_SIZE}
          className="mx-auto border-2 border-[var(--game-bright)] rounded-lg"
        />
      </div>
      
      <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg space-y-3">
        <div className="flex justify-center gap-6">
          <p className="text-lg font-bold text-white">Score: <span className="text-[var(--game-success)]">{score}</span></p>
          <p className="text-lg font-bold text-white">Lines: <span className="text-[var(--game-purple)]">{lines}</span></p>
          <p className="text-lg font-bold text-white">Level: <span className="text-[var(--game-bright)]">{level}</span></p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">Controls: Arrow keys to move and drop</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              Start Tetris
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-3">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 font-bold">Game Over!</p>
                <p className="text-white">Final Score: <span className="text-[var(--game-success)]">{score}</span></p>
              </div>
              <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold">
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}