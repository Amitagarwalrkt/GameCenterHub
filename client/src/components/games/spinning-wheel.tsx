import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface SpinningWheelProps {
  onGameEnd: (score: number) => void;
}

export function SpinningWheel({ onGameEnd }: SpinningWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(5);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segments = [
    { label: 'Jackpot!', points: 500, color: '#ff4757' },
    { label: '+50', points: 50, color: '#3742fa' },
    { label: '+100', points: 100, color: '#2ed573' },
    { label: '+25', points: 25, color: '#ffa502' },
    { label: 'Bonus!', points: 200, color: '#ff6b81' },
    { label: '+75', points: 75, color: '#5352ed' },
    { label: '+150', points: 150, color: '#7bed9f' },
    { label: '+10', points: 10, color: '#ff9f43' },
  ];

  const spinWheel = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setResult(null);

    // Random rotation between 1800-3600 degrees (5-10 full rotations)
    const rotation = 1800 + Math.random() * 1800;
    const segmentAngle = 360 / segments.length;
    const finalAngle = rotation % 360;
    const winningSegmentIndex = Math.floor((360 - finalAngle) / segmentAngle) % segments.length;
    const winningSegment = segments[winningSegmentIndex];

    if (wheelRef.current) {
      wheelRef.current.style.transform = `rotate(${rotation}deg)`;
    }

    setTimeout(() => {
      setIsSpinning(false);
      setResult(winningSegment.label);
      setTotalScore(prev => prev + winningSegment.points);
      setSpinsLeft(prev => prev - 1);

      if (spinsLeft <= 1) {
        setTimeout(() => {
          onGameEnd(totalScore + winningSegment.points);
        }, 1000);
      }
    }, 3000);
  };

  const resetGame = () => {
    setTotalScore(0);
    setSpinsLeft(5);
    setResult(null);
    setIsSpinning(false);
    if (wheelRef.current) {
      wheelRef.current.style.transform = 'rotate(0deg)';
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold mb-4 text-white">Spinning Wheel</h3>
      
      <div className="mb-6 flex justify-center gap-6">
        <p className="text-lg text-white">Score: <span className="font-bold text-[var(--game-success)]">{totalScore}</span></p>
        <p className="text-lg text-white">Spins Left: <span className="font-bold text-[var(--game-bright)]">{spinsLeft}</span></p>
      </div>

      <div className="relative mx-auto mb-6" style={{ width: '300px', height: '300px' }}>
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-white relative overflow-hidden transition-transform duration-3000 ease-out"
          style={{
            background: `conic-gradient(${segments.map((segment, index) => {
              const startAngle = (index * 360) / segments.length;
              const endAngle = ((index + 1) * 360) / segments.length;
              return `${segment.color} ${startAngle}deg ${endAngle}deg`;
            }).join(', ')})`
          }}
        >
          {segments.map((segment, index) => {
            const angle = (index * 360) / segments.length;
            return (
              <div
                key={index}
                className="absolute w-full h-full flex items-center justify-center text-white font-bold text-sm"
                style={{
                  transform: `rotate(${angle + 22.5}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <div
                  className="absolute"
                  style={{
                    top: '20px',
                    transform: `rotate(-${angle + 22.5}deg)`
                  }}
                >
                  {segment.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {result && (
        <div className="mb-4 p-4 bg-[var(--game-blue)]/30 rounded-lg">
          <p className="text-xl font-bold text-[var(--game-success)]">You won: {result}</p>
        </div>
      )}

      {spinsLeft > 0 ? (
        <Button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`px-6 py-3 rounded-lg text-white font-bold ${
            isSpinning 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-[var(--game-success)] hover:bg-[var(--game-success)]/80'
          }`}
        >
          {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
        </Button>
      ) : (
        <div>
          <p className="text-xl font-bold text-[var(--game-purple)] mb-4">
            Game Complete! Final Score: {totalScore}
          </p>
          <Button
            onClick={resetGame}
            className="px-4 py-2 bg-[var(--game-blue)] hover:bg-[var(--game-bright)] rounded-lg text-white"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
}