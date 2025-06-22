import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface Bubble {
  color: string;
  x: number;
  y: number;
}

interface FlyingBubble extends Bubble {
  dx: number;
  dy: number;
}

export function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 600;
  const BUBBLE_RADIUS = 20;

  const COLS = 15;

  const colors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];

  const [bubbles, setBubbles] = useState<Array<Array<Bubble | undefined>>>([]);
  const [shooterBubble, setShooterBubble] = useState<{ color: string; angle: number }>({ color: colors[0], angle: 0 });
  const [flyingBubble, setFlyingBubble] = useState<FlyingBubble | null>(null);

  const initializeBubbles = useCallback(() => {
    const newBubbles: Array<Array<Bubble | undefined>> = [];
    for (let row = 0; row < 6; row++) {
      newBubbles[row] = [];
      for (let col = 0; col < COLS; col++) {
        if ((row % 2 === 0 && col < COLS) || (row % 2 === 1 && col < COLS - 1)) {
          newBubbles[row][col] = {
            color: colors[Math.floor(Math.random() * colors.length)],
            x: col * (BUBBLE_RADIUS * 2) + (row % 2 === 1 ? BUBBLE_RADIUS : 0) + BUBBLE_RADIUS,
            y: row * (BUBBLE_RADIUS * 1.8) + BUBBLE_RADIUS
          };
        }
      }
    }
    setBubbles(newBubbles);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bubbles
    bubbles.forEach(row => {
      if (row) {
        row.forEach(bubble => {
          if (bubble) {
            ctx.fillStyle = bubble.color;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.stroke();
          }
        });
      }
    });

    // Draw flying bubble
    if (flyingBubble) {
      ctx.fillStyle = flyingBubble.color;
      ctx.beginPath();
      ctx.arc(flyingBubble.x, flyingBubble.y, BUBBLE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#333';
      ctx.stroke();
    }

    // Draw shooter
    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;
    
    ctx.fillStyle = shooterBubble.color;
    ctx.beginPath();
    ctx.arc(shooterX, shooterY, BUBBLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Draw aim line
    if (!flyingBubble) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shooterX, shooterY);
      ctx.lineTo(
        shooterX + Math.cos(shooterBubble.angle) * 100,
        shooterY + Math.sin(shooterBubble.angle) * 100
      );
      ctx.stroke();
    }
  }, [bubbles, flyingBubble, shooterBubble]);

  const findConnectedBubbles: (
    startRow: number,
    startCol: number,
    color: string,
    visited: Set<string>
  ) => Array<{ row: number; col: number }> = useCallback(
    (startRow, startCol, color, visited) => {
      const key = `${startRow},${startCol}`;
      if (visited.has(key)) return [];
      
      const bubble = bubbles[startRow]?.[startCol];
      if (!bubble || bubble.color !== color) return [];
      
      visited.add(key);
      let connected = [{ row: startRow, col: startCol }];
      
      // Check neighbors
      const neighbors = [
        [-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]
      ];
      
      neighbors.forEach(([dr, dc]) => {
        const newRow = startRow + dr;
        const newCol = startCol + dc;
        if (newRow >= 0 && newRow < bubbles.length && newCol >= 0) {
          connected = connected.concat(findConnectedBubbles(newRow, newCol, color, visited));
        }
      });

      return connected;
    },
    [bubbles]
  );

  const shoot = useCallback(() => {
    if (flyingBubble) return;

    const shooterX = CANVAS_WIDTH / 2;
    const shooterY = CANVAS_HEIGHT - 50;
    const speed = 8;

    setFlyingBubble({
      x: shooterX,
      y: shooterY,
      dx: Math.cos(shooterBubble.angle) * speed,
      dy: Math.sin(shooterBubble.angle) * speed,
      color: shooterBubble.color
    });
  }, [flyingBubble, shooterBubble]);

  const startGame = useCallback(() => {
    initializeBubbles();
    setScore(0);
    setShooterBubble({ color: colors[Math.floor(Math.random() * colors.length)], angle: 0 });
    setFlyingBubble(null);
    setGameRunning(true);
    setGameOver(false);
  }, [initializeBubbles]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRunning || flyingBubble) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const shooterX = CANVAS_WIDTH / 2;
      const shooterY = CANVAS_HEIGHT - 50;
      
      const angle = Math.atan2(mouseY - shooterY, mouseX - shooterX);
      
      setShooterBubble(prev => ({ ...prev, angle }));
    };

    const handleClick = () => {
      if (gameRunning && !flyingBubble) {
        shoot();
      }
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);
      return () => {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
      };
    }
  }, [gameRunning, flyingBubble, shoot]);

  // Define the gameLoop function
  const gameLoop = useCallback(() => {
    setFlyingBubble((prev) => {
      if (!prev) return null;

      let newBubble = { ...prev };
      newBubble.x += newBubble.dx;
      newBubble.y += newBubble.dy;

      // Wall collision
      if (newBubble.x <= BUBBLE_RADIUS || newBubble.x >= CANVAS_WIDTH - BUBBLE_RADIUS) {
        newBubble.dx = -newBubble.dx;
      }

      // Top collision
      if (newBubble.y <= BUBBLE_RADIUS) {
        const row = 0;
        const col = Math.floor(newBubble.x / (BUBBLE_RADIUS * 2));
        setBubbles(prevBubbles => {
          const newBubbles = [...prevBubbles];
          if (!newBubbles[row]) newBubbles[row] = [];
          newBubbles[row][col] = {
            color: newBubble.color,
            x: col * (BUBBLE_RADIUS * 2) + BUBBLE_RADIUS,
            y: BUBBLE_RADIUS
          };
          return newBubbles;
        });
        setShooterBubble({ color: colors[Math.floor(Math.random() * colors.length)], angle: 0 });
        return null;
      }

      // Bubble collision
      for (let row = 0; row < bubbles.length; row++) {
        if (bubbles[row]) {
          for (let col = 0; col < bubbles[row].length; col++) {
            const bubble = bubbles[row][col];
            if (bubble) {
              const distance = Math.sqrt(
                Math.pow(newBubble.x - bubble.x, 2) + Math.pow(newBubble.y - bubble.y, 2)
              );
              if (distance < BUBBLE_RADIUS * 2) {
                // Place bubble
                const newRow = row + 1;
                setBubbles(prevBubbles => {
                  const newBubbles = [...prevBubbles];
                  if (!newBubbles[newRow]) newBubbles[newRow] = [];
                  newBubbles[newRow][col] = {
                    color: newBubble.color,
                    x: bubble.x,
                    y: bubble.y + BUBBLE_RADIUS * 1.8
                  };
                  return newBubbles;
                });

                // Check for matches
                const connected = findConnectedBubbles(newRow, col, newBubble.color, new Set());
                if (connected.length >= 3) {
                  setBubbles(prevBubbles => {
                    const newBubbles = [...prevBubbles];
                    connected.forEach(({ row: r, col: c }) => {
                      if (newBubbles[r] && newBubbles[r][c]) {
                        delete newBubbles[r][c];
                        setScore(prev => prev + 10);
                      }
                    });
                    return newBubbles;
                  });
                }

                setShooterBubble({ color: colors[Math.floor(Math.random() * colors.length)], angle: 0 });
                return null;
              }
            }
          }
        }
      }

      return newBubble;
    });
  }, [bubbles, colors, findConnectedBubbles]);

  useEffect(() => {
    if (gameRunning) {
      gameLoopRef.current = window.setInterval(gameLoop, 16);
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

  useEffect(() => {
    draw();
  }, [draw]);

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
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">Aim with mouse and click to shoot bubbles</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              Start Bubble Shooter
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-3">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                <p className="text-green-400 font-bold">Great Job!</p>
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