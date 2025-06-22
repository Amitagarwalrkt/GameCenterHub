import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MemoryGameProps {
  onGameEnd: (score: number) => void;
}

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame({ onGameEnd }: MemoryGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const symbols = ['🎮', '🎯', '🎲', '🎪', '🎨', '🎭', '⭐', '🎵'];
  const totalPairs = symbols.length;

  const initializeGame = () => {
    const cardSymbols = [...symbols, ...symbols];
    const shuffledCards = cardSymbols
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        isFlipped: false,
        isMatched: false,
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameStarted(true);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards[cardId].isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      setTimeout(() => {
        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards[firstId];
        const secondCard = cards[secondId];

        if (firstCard.symbol === secondCard.symbol) {
          // Match found
          setCards(prev => prev.map(card => 
            (card.id === firstId || card.id === secondId) 
              ? { ...card, isMatched: true }
              : card
          ));
          setMatchedPairs(prev => prev + 1);
          
          if (matchedPairs + 1 === totalPairs) {
            // Game completed
            const finalScore = Math.max(1000 - moves * 10, 100);
            onGameEnd(finalScore);
          }
        } else {
          // No match
          setCards(prev => prev.map(card => 
            (card.id === firstId || card.id === secondId) 
              ? { ...card, isFlipped: false }
              : card
          ));
        }
        
        setFlippedCards([]);
      }, 1000);
    }
  };

  useEffect(() => {
    if (matchedPairs === totalPairs && gameStarted) {
      const finalScore = Math.max(1000 - moves * 10, 100);
      setTimeout(() => onGameEnd(finalScore), 500);
    }
  }, [matchedPairs, totalPairs, moves, onGameEnd, gameStarted]);

  if (!gameStarted) {
    return (
      <div className="text-center space-y-4">
        <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-white">Memory Game</h3>
          <p className="text-gray-300 mb-6">Flip cards and match pairs to win! Test your memory skills.</p>
          <Button 
            onClick={initializeGame}
            className="px-6 py-3 bg-[var(--game-success)] hover:bg-[var(--game-success)]/80 rounded-lg text-white font-bold glow-animation"
          >
            🧠 Start Memory Challenge
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="bg-gradient-to-r from-[var(--game-dark)] to-[var(--game-blue)] p-4 rounded-lg">
        <div className="mb-6 flex justify-center gap-6">
          <div className="bg-[var(--game-blue)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg text-white">Moves: <span className="font-bold text-[var(--game-bright)]">{moves}</span></p>
          </div>
          <div className="bg-[var(--game-purple)]/30 px-4 py-2 rounded-lg">
            <p className="text-lg text-white">Pairs: <span className="font-bold text-[var(--game-success)]">{matchedPairs}/{totalPairs}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto mb-6 p-4 bg-[var(--game-darker)]/50 rounded-lg">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => flipCard(card.id)}
              className={`w-18 h-18 text-2xl rounded-lg transition-all duration-300 border-2 shadow-lg transform
                ${card.isMatched 
                  ? 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500 text-white shadow-green-500/20 scale-105' 
                  : card.isFlipped 
                  ? 'bg-gradient-to-br from-[var(--game-bright)] to-[var(--game-purple)] border-[var(--game-bright)] text-white shadow-[var(--game-bright)]/20' 
                  : 'bg-gradient-to-br from-[var(--game-blue)] to-[var(--game-darker)] border-[var(--game-blue)] hover:from-[var(--game-bright)] hover:to-[var(--game-purple)] text-white hover:scale-105'
                }`}
              disabled={card.isMatched || flippedCards.length === 2}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '❓'}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={initializeGame}
        className="px-6 py-3 bg-[var(--game-blue)] hover:bg-[var(--game-bright)] rounded-lg text-white font-bold glow-animation"
      >
        🔄 New Game
      </Button>
    </div>
  );
}
