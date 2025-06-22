import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface CarRacingProps {
  onGameEnd: (score: number) => void;
}

interface Car {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function CarRacing({ onGameEnd }: CarRacingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const gameStateRef = useRef({
    car: { x: 185, y: 500, width: 30, height: 50 },
    obstacles: [] as Obstacle[],
    score: 0,
    speed: 2
  });

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;

  const drawRoad = useCallback((ctx: CanvasRenderingContext2D) => {
    // Road background gradient
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
    gradient.addColorStop(0, '#1a5d1a');
    gradient.addColorStop(0.2, '#2d2d2d');
    gradient.addColorStop(0.8, '#2d2d2d');
    gradient.addColorStop(1, '#1a5d1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Road surface
    ctx.fillStyle = '#404040';
    ctx.fillRect(50, 0, CANVAS_WIDTH - 100, CANVAS_HEIGHT);
    
    // Road edges
    ctx.fillStyle = '#fff';
    ctx.fillRect(50, 0, 4, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 54, 0, 4, CANVAS_HEIGHT);
    
    // Center line
    ctx.fillStyle = '#ffff00';
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.fillRect(CANVAS_WIDTH / 2 - 2, i, 4, 20);
    }
  }, []);

  const drawCar = useCallback((ctx: CanvasRenderingContext2D, car: Car) => {
    // Car shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(car.x + 2, car.y + 2, car.width, car.height);
    
    // Car body
    ctx.fillStyle = '#3282b8';
    ctx.fillRect(car.x, car.y, car.width, car.height);
    
    // Car details
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(car.x + 5, car.y + 5, car.width - 10, 15); // windshield
    
    // Car wheels
    ctx.fillStyle = '#000';
    ctx.fillRect(car.x - 2, car.y + 5, 4, 8);
    ctx.fillRect(car.x - 2, car.y + car.height - 13, 4, 8);
    ctx.fillRect(car.x + car.width - 2, car.y + 5, 4, 8);
    ctx.fillRect(car.x + car.width - 2, car.y + car.height - 13, 4, 8);
  }, []);

  const drawObstacles = useCallback((ctx: CanvasRenderingContext2D, obstacles: Obstacle[]) => {
    obstacles.forEach(obstacle => {
      // Obstacle shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(obstacle.x + 2, obstacle.y + 2, obstacle.width, obstacle.height);
      
      // Obstacle body
      ctx.fillStyle = '#ff5252';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      
      // Obstacle details
      ctx.fillStyle = '#ffcccc';
      ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 15);
      
      // Obstacle wheels
      ctx.fillStyle = '#000';
      ctx.fillRect(obstacle.x - 2, obstacle.y + 5, 4, 8);
      ctx.fillRect(obstacle.x - 2, obstacle.y + obstacle.height - 13, 4, 8);
      ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + 5, 4, 8);
      ctx.fillRect(obstacle.x + obstacle.width - 2, obstacle.y + obstacle.height - 13, 4, 8);
    });
  }, []);

  const checkCollision = useCallback((car: Car, obstacle: Obstacle) => {
    return car.x < obstacle.x + obstacle.width &&
           car.x + car.width > obstacle.x &&
           car.y < obstacle.y + obstacle.height &&
           car.y + car.height > obstacle.y;
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { car, obstacles, speed } = gameStateRef.current;
    
    // Clear and draw road
    drawRoad(ctx);
    
    // Move obstacles
    obstacles.forEach(obstacle => {
      obstacle.y += speed;
    });
    
    // Remove off-screen obstacles and add score
    gameStateRef.current.obstacles = obstacles.filter(obstacle => {
      if (obstacle.y > CANVAS_HEIGHT) {
        gameStateRef.current.score += 10;
        setScore(gameStateRef.current.score);
        return false;
      }
      return true;
    });
    
    // Generate new obstacles (respecting road boundaries)
    if (Math.random() < 0.02) {
      const roadStart = 60;
      const roadEnd = CANVAS_WIDTH - 100;
      gameStateRef.current.obstacles.push({
        x: roadStart + Math.random() * (roadEnd - roadStart - 40),
        y: -50,
        width: 40,
        height: 50
      });
    }
    
    // Check collisions
    for (const obstacle of gameStateRef.current.obstacles) {
      if (checkCollision(car, obstacle)) {
        setGameRunning(false);
        setGameOver(true);
        onGameEnd(gameStateRef.current.score);
        return;
      }
    }
    
    drawObstacles(ctx, gameStateRef.current.obstacles);
    drawCar(ctx, car);
    
    gameStateRef.current.speed += 0.001; // Gradually increase difficulty
  }, [gameRunning, drawRoad, drawCar, drawObstacles, checkCollision, onGameEnd]);

  useEffect(() => {
    if (!gameRunning) return;

    const interval = setInterval(gameLoop, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameRunning, gameLoop]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameRunning) return;
      
      const { car } = gameStateRef.current;
      
      switch(e.key.toLowerCase()) {
        case 'a':
        case 'arrowleft':
          gameStateRef.current.car.x = Math.max(54, car.x - 20); // left road edge (50 + 4)
          break;
        case 'd':
        case 'arrowright':
          gameStateRef.current.car.x = Math.min(CANVAS_WIDTH - 54 - car.width, car.x + 20); // right road edge (400 - 54 - car.width)
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameRunning]);

  const startGame = () => {
    const carStartX = CANVAS_WIDTH / 2 - 15; // Center the car
    gameStateRef.current = {
      car: { x: carStartX, y: 500, width: 30, height: 50 },
      obstacles: [],
      score: 0,
      speed: 3
    };
    setScore(0);
    setGameRunning(true);
    setGameOver(false);
    
    // Initial draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawRoad(ctx);
        drawCar(ctx, gameStateRef.current.car);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawRoad(ctx);
        drawCar(ctx, gameStateRef.current.car);
      }
    }
  }, [drawRoad, drawCar]);

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-b from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="mx-auto border-2 border-[var(--game-bright)] rounded-lg shadow-lg shadow-[var(--game-bright)]/20"
        />
      </div>
      
      <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg space-y-3">
        <div className="flex justify-center">
          <p className="text-lg font-bold text-white">Score: <span className="text-[var(--game-success)]">{score}</span></p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">Controls: A/D keys or Left/Right arrows</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              🏎️ Start Racing
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-3">
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                <p className="text-red-400 font-bold">Crash!</p>
                <p className="text-white">Final Score: <span className="text-[var(--game-success)]">{score}</span></p>
              </div>
              <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold">
                🔄 Race Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
