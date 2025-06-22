import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

interface PongProps {
  onGameEnd: (score: number) => void;
}

export function Pong({ onGameEnd }: PongProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 400;
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 80;
  const BALL_SIZE = 10;

  const [playerPaddle, setPlayerPaddle] = useState({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [aiPaddle, setAiPaddle] = useState({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
  const [ball, setBall] = useState({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: 3,
    dy: 3
  });

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

    // Draw center line
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(20, playerPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(CANVAS_WIDTH - 30, aiPaddle.y, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw scores
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(score.toString(), CANVAS_WIDTH / 4, 40);
    ctx.fillText(aiScore.toString(), (3 * CANVAS_WIDTH) / 4, 40);
  }, [playerPaddle, aiPaddle, ball, score, aiScore]);

  const gameLoop = useCallback(() => {
    if (!gameRunning) return;

    setBall(prevBall => {
      let newBall = { ...prevBall };
      
      // Move ball
      newBall.x += newBall.dx;
      newBall.y += newBall.dy;

      // Ball collision with top/bottom walls
      if (newBall.y <= BALL_SIZE / 2 || newBall.y >= CANVAS_HEIGHT - BALL_SIZE / 2) {
        newBall.dy = -newBall.dy;
      }

      // Ball collision with paddles
      if (
        newBall.x <= 30 + PADDLE_WIDTH &&
        newBall.y >= playerPaddle.y &&
        newBall.y <= playerPaddle.y + PADDLE_HEIGHT
      ) {
        newBall.dx = -newBall.dx;
        newBall.dx *= 1.05; // Increase speed slightly
      }

      if (
        newBall.x >= CANVAS_WIDTH - 30 - PADDLE_WIDTH &&
        newBall.y >= aiPaddle.y &&
        newBall.y <= aiPaddle.y + PADDLE_HEIGHT
      ) {
        newBall.dx = -newBall.dx;
        newBall.dx *= 1.05;
      }

      // Score points
      if (newBall.x <= 0) {
        setAiScore(prev => prev + 1);
        newBall = {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: 3,
          dy: Math.random() > 0.5 ? 3 : -3
        };
      }

      if (newBall.x >= CANVAS_WIDTH) {
        setScore(prev => prev + 1);
        newBall = {
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          dx: -3,
          dy: Math.random() > 0.5 ? 3 : -3
        };
      }

      return newBall;
    });

    // AI paddle movement
    setAiPaddle(prev => {
      const paddleCenter = prev.y + PADDLE_HEIGHT / 2;
      const diff = ball.y - paddleCenter;
      const speed = 4;
      
      return {
        y: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, prev.y + Math.sign(diff) * speed))
      };
    });

    // Check win condition  
    if (score >= 5) {
      setGameRunning(false);
      setGameOver(true);
      onGameEnd(score * 100);
    } else if (aiScore >= 5) {
      setGameRunning(false);
      setGameOver(true);
      onGameEnd(score * 10);
    }
  }, [gameRunning, ball, playerPaddle, aiPaddle, score, aiScore, onGameEnd]);

  const startGame = useCallback(() => {
    setScore(0);
    setAiScore(0);
    setPlayerPaddle({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    setAiPaddle({ y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2 });
    setBall({
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      dx: 3,
      dy: 3
    });
    setGameRunning(true);
    setGameOver(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!gameRunning) return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;
      
      setPlayerPaddle({
        y: Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, mouseY - PADDLE_HEIGHT / 2))
      });
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      return () => canvas.removeEventListener('mousemove', handleMouseMove);
    }
  }, [gameRunning]);

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
          className="mx-auto border-2 border-[var(--game-bright)] rounded-lg shadow-lg shadow-[var(--game-bright)]/20 cursor-none"
        />
      </div>
      
      <div className="bg-[var(--game-darker)]/50 p-4 rounded-lg space-y-3">
        <div className="flex justify-center gap-6">
          <p className="text-lg font-bold text-white">Player: <span className="text-[var(--game-success)]">{score}</span></p>
          <p className="text-lg font-bold text-white">AI: <span className="text-[var(--game-error)]">{aiScore}</span></p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-300 mb-2">Move your mouse to control the paddle</p>
          
          {!gameRunning && !gameOver && (
            <Button onClick={startGame} className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg font-bold glow-animation">
              Start Pong
            </Button>
          )}
          
          {gameOver && (
            <div className="space-y-3">
              <div className={`border rounded-lg p-3 ${score >= 5 ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                <p className={`font-bold ${score >= 5 ? 'text-green-400' : 'text-red-400'}`}>
                  {score >= 5 ? 'You Win!' : 'Game Over!'}
                </p>
                <p className="text-white">Final Score: {score} - {aiScore}</p>
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