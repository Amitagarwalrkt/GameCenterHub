import { useState, useEffect } from 'react';
import { Search, Gamepad2, Volume2, VolumeX, Moon, Sun, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { GameModal } from '@/components/game-modal';
import { GAMES } from '@/lib/game-types';
import { GameStorage } from '@/lib/game-storage';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { motion } from "framer-motion";

export default function GameCenter() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch global high scores from database
  const { data: globalHighScores = [] } = useQuery<any[]>({
    queryKey: ['/api/scores'],
    enabled: true,
  });

  // Save score to database
  const saveScoreMutation = useMutation({
    mutationFn: async (scoreData: { gameType: string; score: number; playerName?: string }) => {
      return apiRequest('POST', '/api/scores', scoreData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scores'] });
    },
  });

  useEffect(() => {
    // Load settings from localStorage
    setSoundEnabled(GameStorage.getSoundEnabled());
    const savedDarkMode = GameStorage.getDarkMode();
    setDarkMode(savedDarkMode);
    setHighScores(GameStorage.getHighScores());
    
    // Apply initial dark mode state to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'classic', label: 'Classic' },
    { id: 'action', label: 'Action' },
    { id: 'board', label: 'Board' },
    { id: 'racing', label: 'Racing' },
    { id: 'puzzle', label: 'Puzzle' },
    { id: 'arcade', label: 'Arcade' }
  ];

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    GameStorage.setSoundEnabled(newState);
    toast({
      title: newState ? 'Sound enabled' : 'Sound disabled',
      duration: 2000,
    });
  };

  const toggleDarkMode = () => {
    const newState = !darkMode;
    setDarkMode(newState);
    GameStorage.setDarkMode(newState);
    
    // Toggle dark class on document element
    if (newState) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    toast({
      title: newState ? 'Dark mode enabled' : 'Light mode enabled',
      duration: 2000,
    });
  };

  const openGame = (gameId: string) => {
    setSelectedGame(gameId);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  const updateHighScore = (game: string, score: number) => {
    // Save to local storage
    const isNewRecord = GameStorage.saveHighScore(game, score);
    if (isNewRecord) {
      setHighScores(GameStorage.getHighScores());
      toast({
        title: 'New High Score!',
        description: `${score} points in ${GAMES.find(g => g.id === game)?.title}`,
        duration: 3000,
      });
    }

    // Save to database
    saveScoreMutation.mutate({
      gameType: game,
      score: score,
      playerName: `Player_${Date.now()}` // Generate a simple player name
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-[var(--game-dark)] to-[var(--game-darker)] text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900'
    }`}>
      {/* Navigation Header */}
      <nav className={`border-b sticky top-0 z-40 transition-colors duration-300 ${
        darkMode 
          ? 'bg-[var(--game-darker)] border-[var(--game-bright)]/30' 
          : 'bg-white/80 backdrop-blur-sm border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="text-[var(--game-bright)] text-2xl" />
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Game Center
                </h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-[var(--game-blue)]/20 hover:bg-[var(--game-blue)]/40 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSound}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-[var(--game-blue)]/20 hover:bg-[var(--game-blue)]/40 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[var(--game-bright)] to-[var(--game-purple)] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Welcome to Game Center
          </motion.h2>
          <p className="text-xl text-gray-300 mb-8">Play amazing games directly in your browser!</p>
          
          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-3 bg-[var(--game-darker)] border border-[var(--game-blue)]/30 rounded-lg text-white placeholder-gray-400 search-glow"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            </div>
            
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-[var(--game-blue)]'
                      : 'bg-[var(--game-blue)]/40 hover:bg-[var(--game-blue)]'
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredGames.map((game) => (
            <Card 
              key={game.id} 
              className={`game-card rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-[var(--game-darker)] border-[var(--game-blue)]/30 hover:bg-[var(--game-blue)]/10' 
                  : 'bg-white border border-gray-200 hover:shadow-lg hover:border-blue-300'
              }`}
              onClick={() => openGame(game.id)}
            >
              <CardContent className="p-6">
                <img 
                  src={game.thumbnail} 
                  alt={game.title}
                  className="w-full h-40 object-cover rounded-lg mb-4 shadow-md"
                />
                <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {game.title}
                </h3>
                <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {game.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--game-bright)] capitalize font-medium">
                    {game.category}
                  </span>
                  <Button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode 
                      ? 'bg-[var(--game-bright)] hover:bg-[var(--game-bright)]/80 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    Play
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No games found matching your criteria.
            </p>
          </div>
        )}

        {/* High Scores Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal High Scores */}
          <Card className={`rounded-xl transition-colors duration-300 ${
            darkMode ? 'bg-[var(--game-darker)]' : 'bg-white border border-gray-200'
          }`}>
            <CardContent className="p-6">
              <h3 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                🎮 Personal Best
              </h3>
              <div className="space-y-2">
                {Object.keys(highScores).length === 0 ? (
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No personal scores yet. Start playing!
                  </p>
                ) : (
                  Object.entries(highScores).map(([gameId, score]) => {
                    const game = GAMES.find(g => g.id === gameId);
                    return (
                      <div key={gameId} className={`flex justify-between items-center rounded-lg p-3 ${
                        darkMode ? 'bg-[var(--game-blue)]/20' : 'bg-blue-50'
                      }`}>
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {game?.title || gameId}
                        </span>
                        <span className="font-bold text-[var(--game-bright)]">{score}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Global Leaderboard */}
          <Card className={`rounded-xl transition-colors duration-300 ${
            darkMode ? 'bg-[var(--game-darker)]' : 'bg-white border border-gray-200'
          }`}>
            <CardContent className="p-6">
              <h3 className={`text-2xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Trophy className="inline-block mr-2" size={24} />
                Global Leaderboard
              </h3>
              <div className="space-y-2">
                {globalHighScores.length === 0 ? (
                  <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No global scores yet. Be the first!
                  </p>
                ) : (
                  globalHighScores.slice(0, 10).map((score: any, index: number) => {
                    const game = GAMES.find(g => g.id === score.gameType);
                    return (
                      <div key={score.id} className={`flex justify-between items-center rounded-lg p-3 ${
                        darkMode ? 'bg-[var(--game-purple)]/20' : 'bg-purple-50'
                      }`}>
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-yellow-500 text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-orange-600 text-white' :
                            'bg-[var(--game-blue)] text-white'
                          }`}>
                            {index + 1}
                          </span>
                          <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                            {game?.title || score.gameType}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[var(--game-success)]">{score.score}</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {score.playerName}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className={`mt-16 py-8 border-t transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-[var(--game-darker)] to-[var(--game-dark)] border-[var(--game-blue)]/30'
          : 'bg-gradient-to-r from-gray-50 to-white border-gray-200'
      }`}>
        <div className="text-center">
          <p className={`text-sm mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Game Center - Premium Mini Games Collection
          </p>
          <p className="text-[var(--game-bright)] font-bold">Created by Amit, Komal, Nikita and Satyajeet</p>
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            © 2025 All rights reserved
          </p>
        </div>
      </footer>

      {/* Game Modal */}
      {selectedGame && (
        <GameModal
          gameId={selectedGame}
          onClose={closeGame}
          onUpdateHighScore={updateHighScore}
        />
      )}
    </div>
  );
}
