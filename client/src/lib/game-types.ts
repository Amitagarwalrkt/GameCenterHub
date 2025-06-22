export interface GameConfig {
  id: string;
  title: string;
  description: string;
  category: 'classic' | 'action' | 'board' | 'racing' | 'puzzle' | 'arcade';
  thumbnail: string;
}

export interface GameScore {
  game: string;
  score: number;
  playerName?: string;
  timestamp: Date;
}

export const GAMES: GameConfig[] = [
  // Classic Games
  {
    id: 'snake',
    title: 'Snake Game',
    description: 'Classic snake game. Eat food and grow longer!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=300&fit=crop'
  },
  {
    id: 'tetris',
    title: 'Tetris',
    description: 'Stack falling blocks to clear lines!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1606503153255-59d8b8b3e4d5?w=400&h=300&fit=crop'
  },
 
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Tap to keep the bird flying and avoid obstacles!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1606503153255-59d8b8b3e4d5?w=400&h=300&fit=crop'
  },
  {
    id: 'pong',
    title: 'Pong',
    description: 'The original arcade game. Bounce the ball!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks with your paddle!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1594736797933-d0d83ba97bd5?w=400&h=300&fit=crop'
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    description: 'Defend Earth from alien invasion!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop'
  },
  {
    id: 'memory',
    title: 'Memory Game',
    description: 'Flip cards and match pairs to win!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'wheel',
    title: 'Spinning Wheel',
    description: 'Spin the wheel and test your luck!',
    category: 'classic',
    thumbnail: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=400&h=300&fit=crop'
  },

  // Action Games
  {
    id: 'shooting',
    title: 'Target Shooter',
    description: 'Aim and shoot targets to score points!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  },
  {
    id: 'zombie-shooter',
    title: 'Zombie Shooter',
    description: 'Survive the zombie apocalypse!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  },
  {
    id: 'asteroid-field',
    title: 'Asteroid Field',
    description: 'Navigate through dangerous asteroids!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop'
  },
  {
    id: 'platform-jumper',
    title: 'Platform Jumper',
    description: 'Jump between platforms and avoid falling!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'
  },
  {
    id: 'ninja-run',
    title: 'Ninja Run',
    description: 'Run and slice through obstacles as a ninja!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1574047721170-47b5df82df6a?w=400&h=300&fit=crop'
  },
  {
    id: 'tower-defense',
    title: 'Tower Defense',
    description: 'Build towers to defend against enemy waves!',
    category: 'action',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  },

  // Board Games
  {
    id: 'tictactoe',
    title: 'Tic Tac Toe',
    description: 'Classic X and O game for two players.',
    category: 'board',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    description: 'Classic mine detection puzzle game!',
    category: 'board',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f46e?w=400&h=300&fit=crop'
  },
  {
    id: 'checkers',
    title: 'Checkers',
    description: 'Classic board game of strategy!',
    category: 'board',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'chess',
    title: 'Chess',
    description: 'The ultimate strategy game!',
    category: 'board',
    thumbnail: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=400&h=300&fit=crop'
  },
  {
    id: 'connect-four',
    title: 'Connect Four',
    description: 'Connect four pieces in a row to win!',
    category: 'board',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop'
  },

  // Racing Games
  {
    id: 'racing',
    title: 'Car Racing',
    description: 'Race your car and avoid obstacles!',
    category: 'racing',
    thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=300&fit=crop'
  },
  {
    id: 'bike-racing',
    title: 'Bike Racing',
    description: 'Race motorcycles through challenging tracks!',
    category: 'racing',
    thumbnail: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'
  },
  {
    id: 'boat-racing',
    title: 'Boat Racing',
    description: 'Speed across the water in racing boats!',
    category: 'racing',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'
  },
  {
    id: 'airplane-racing',
    title: 'Airplane Racing',
    description: 'Soar through the skies in aerial races!',
    category: 'racing',
    thumbnail: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop'
  },

  // Puzzle Games
  {
    id: 'sliding-puzzle',
    title: 'Sliding Puzzle',
    description: 'Rearrange tiles to complete the picture!',
    category: 'puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'word-search',
    title: 'Word Search',
    description: 'Find hidden words in the letter grid!',
    category: 'puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Fill the grid with numbers following rules!',
    category: 'puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1611996575749-79a3a250f46e?w=400&h=300&fit=crop'
  },
  {
    id: 'jigsaw-puzzle',
    title: 'Jigsaw Puzzle',
    description: 'Piece together beautiful images!',
    category: 'puzzle',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },

  // Arcade Games
  {
    id: 'bubble-shooter',
    title: 'Bubble Shooter',
    description: 'Match and pop colorful bubbles!',
    category: 'arcade',
    thumbnail: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop'
  },
  {
    id: 'pinball',
    title: 'Pinball',
    description: 'Classic pinball machine experience!',
    category: 'arcade',
    thumbnail: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=300&fit=crop'
  },
  {
    id: 'whack-a-mole',
    title: 'Whack-a-Mole',
    description: 'Hit the moles as they pop up!',
    category: 'arcade',
    thumbnail: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  }
];
