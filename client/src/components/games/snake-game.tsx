import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface SnakeGameProps {
  onGameEnd: (score: number) => void;
}

export function SnakeGame({ onGameEnd }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const GRID_SIZE = 20;
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 400;

  // Game state
  const [snake, setSnake] = useState([{ x: 240, y: 200 }]);
  const [food, setFood] = useState({ x: 100, y: 100 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });

  // Generate random food position
  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)) * GRID_SIZE;
    const y = Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)) * GRID_SIZE;
    return { x, y };
  }, []);

  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CANVAS_WIDTH; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i <= CANVAS_HEIGHT; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        const headGradient = ctx.createRadialGradient(
          segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, 0,
          segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2
        );
        headGradient.addColorStop(0, '#4ade80');
        headGradient.addColorStop(1, '#22c55e');
        ctx.fillStyle = headGradient;
      } else {
        // Body
        const bodyGradient = ctx.createRadialGradient(
          segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, 0,
          segment.x + GRID_SIZE/2, segment.y + GRID_SIZE/2, GRID_SIZE/2
        );
        bodyGradient.addColorStop(0, '#22c55e');
        bodyGradient.addColorStop(1, '#16a34a');
        ctx.fillStyle = bodyGradient;
      }
      
      ctx.fillRect(segment.x + 1, segment.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
      
      // Add border
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 1;
      ctx.strokeRect(segment.x + 1, segment.y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
    });

    // Draw food
    const foodGradient = ctx.createRadialGradient(
      food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, 0,
      food.x + GRID_SIZE/2, food.y + GRID_SIZE/2, GRID_SIZE/2
    );
    foodGradient.addColorStop(0, '#ef4444');
    foodGradient.addColorStop(1, '#dc2626');
    ctx.fillStyle = foodGradient;
    ctx.fillRect(food.x + 2, food.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
    
    // Food border
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 1;
    ctx.strokeRect(food.x + 2, food.y + 2, GRID_SIZE - 4, GRID_SIZE - 4);
  }, [snake, food]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!gameRunning || (direction.x === 0 && direction.y === 0)) {
      return;
    }

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= CANVAS_WIDTH || head.y < 0 || head.y >= CANVAS_HEIGHT) {
        setGameRunning(false);
        setGameOver(true);
        onGameEnd(score);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameRunning(false);
        setGameOver(true);
        onGameEnd(score);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 10);
        let newFood: { x: number; y: number };
        do {
          newFood = generateFood();
        } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        setFood(newFood);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameRunning, direction, food, score, onGameEnd, generateFood]);

  // Start game
  const startGame = useCallback(() => {
    setSnake([{ x: 240, y: 200 }]);
    setFood(generateFood());
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
  }, [generateFood]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;

      e.preventDefault();
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction.y === 0) setDirection({ x: 0, y: -GRID_SIZE });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction.y === 0) setDirection({ x: 0, y: GRID_SIZE });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction.x === 0) setDirection({ x: -GRID_SIZE, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction.x === 0) setDirection({ x: GRID_SIZE, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning, direction]);

  // Game loop timer
  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = window.setInterval(gameLoop, 150);
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
  }, [gameRunning, gameLoop]);

  // Draw the game
  useEffect(() => {
    draw();
  }, [draw]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial draw
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Snake Game', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20);
    ctx.font = '16px Arial';
    ctx.fillText('Click Start to Play', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20);
  }, []);

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="mx-auto border-2 border-[var(--game-bright)] rounded-lg shadow-lg shadow-[var(--game-bright)]/20"
        />
      </div>
      
      <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg space-y-3">
        <div className="flex justify-center gap-6">
          <p className="text-lg font-bold text-white">Score: <span className="text-[var(--game-success)]">{score}</span></p>
          {highScore > 0 && (
            <p className="text-lg font-bold text-white">Best: <span className="text-[var(--game-purple)]">{highScore}</span></p>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">Controls: Arrow keys or WASD</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              Start Snake Game
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