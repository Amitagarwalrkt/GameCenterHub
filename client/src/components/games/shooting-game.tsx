import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface ShootingGameProps {
  onGameEnd: (score: number) => void;
}

interface Target {
  x: number;
  y: number;
  radius: number;
  life: number;
}

export function ShootingGame({ onGameEnd }: ShootingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const gameStateRef = useRef({
    targets: [] as Target[],
    score: 0
  });

  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = 400;

  const drawTargets = useCallback((ctx: CanvasRenderingContext2D, targets: Target[]) => {
    targets.forEach(target => {
      // Draw target circles
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameRunning) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Generate new targets
    if (Math.random() < 0.02) {
      gameStateRef.current.targets.push({
        x: Math.random() * (CANVAS_WIDTH - 60) + 30,
        y: Math.random() * (CANVAS_HEIGHT - 60) + 30,
        radius: 20 + Math.random() * 20,
        life: 3000 // 3 seconds
      });
    }
    
    // Update targets
    gameStateRef.current.targets.forEach(target => {
      target.life -= 16; // ~60fps
    });
    
    // Remove expired targets
    gameStateRef.current.targets = gameStateRef.current.targets.filter(target => target.life > 0);
    
    drawTargets(ctx, gameStateRef.current.targets);
  }, [gameRunning, drawTargets]);

  useEffect(() => {
    if (!gameRunning) return;

    const interval = setInterval(gameLoop, 16); // ~60fps
    return () => clearInterval(interval);
  }, [gameRunning, gameLoop]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameRunning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if any target was hit
    for (let i = gameStateRef.current.targets.length - 1; i >= 0; i--) {
      const target = gameStateRef.current.targets[i];
      const distance = Math.sqrt(
        Math.pow(clickX - target.x, 2) + 
        Math.pow(clickY - target.y, 2)
      );
      
      if (distance <= target.radius) {
        const points = Math.floor(100 - target.radius); // Smaller targets = more points
        gameStateRef.current.score += points;
        setScore(gameStateRef.current.score);
        gameStateRef.current.targets.splice(i, 1);
        break;
      }
    }
  }, [gameRunning]);

  const startGame = () => {
    gameStateRef.current = {
      targets: [],
      score: 0
    };
    setScore(0);
    setTimeLeft(30);
    setGameRunning(true);
    setGameOver(false);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameRunning(false);
          setGameOver(true);
          onGameEnd(gameStateRef.current.score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Initial draw
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }
  }, []);

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="mx-auto border-2 border-[var(--game-bright)] rounded-lg cursor-crosshair shadow-lg shadow-[var(--game-bright)]/20"
          onClick={handleCanvasClick}
        />
      </div>
      
      <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg space-y-3">
        <div className="flex justify-center gap-6 mb-4">
          <div className="bg-[var(--game-blue)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg font-bold text-white">Score: <span className="text-[var(--game-success)]">{score}</span></p>
          </div>
          <div className="bg-[var(--game-warning)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg font-bold text-white">Time: <span className="text-[var(--game-bright)]">{timeLeft}s</span></p>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">🎯 Click on targets to shoot them!</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              🎯 Start Shooting
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-3">
              <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                <p className="text-yellow-400 font-bold">Time's up!</p>
                <p className="text-white">Final Score: <span className="text-[var(--game-success)]">{score}</span></p>
              </div>
              <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold">
                🔄 Play Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
