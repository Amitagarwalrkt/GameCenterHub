## Overview
# Game Centre Application
This is a full-stack game centre application built with React (frontend) and Express.js (backend). The application provides a platform for playing various browser-based games including Snake, Tic-Tac-Toe, Memory Game, Car Racing, and Target Shooting. It features score tracking, user preferences, and a modern gaming interface.
## System Architecture
### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom shadcn/ui components
### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Connection**: Neon Database (serverless PostgreSQL)
- **Development Server**: tsx for TypeScript execution - **Production Build**: esbuild for server bundling

## Key Components
### Game Engine
- **Game Modal System**: Centralized game launcher with restart functionality
- **Individual Game Components**: Snake, Tic-Tac-Toe, Memory, Car Racing, Shooting
- **Canvas-based Games**: Snake, Car Racing, and Shooting games use HTML5 Canvas
- **Score Management**: Local storage with server-side persistence
- **Game Categories**: Games organized by type (classic, action, board, racing)
### Data Layer
- **Database Schema**: Users table and game_scores table
- **Storage Interface**: Abstracted storage layer (currently in- memory, designed for database integration)
- **Score Persistence**: RESTful API endpoints for saving and retrieving high scores
### User Interface
- **Game Center Dashboard**: Grid-based game selection with search and filtering
- **Dark/Light Mode**: Theme switching with localStorage persistence
- **Sound Controls**: Audio toggle functionality
- **Responsive Design**: Mobile-first approach with Tailwind CSS
## Data Flow

1. **Game Selection**: User selects game from dashboard → Opens game modal
2. **Game Play**: Game runs in isolated component with canvas rendering
3. **Score Submission**: Game end triggers score calculation → Local storage update → API call to persist score
4. **High Score Display**: Dashboard shows personal best scores from localStorage
5. **Settings Persistence**: User preferences stored in localStorage
## External Dependencies
### Frontend Dependencies
- **UI Framework**: React, Tailwind CSS, Radix UI components
- **State Management**: TanStack Query for server state management
- **Game Assets**: Unsplash images for game thumbnails - **Icons**: Lucide React icon library
### Backend Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **ORM**: Drizzle ORM with Zod schema validation
- **Session Management**: connect-pg-simple for PostgreSQL sessions
- **Development**: Replit-specific plugins for development environment
### Development Tools
- **TypeScript**: Full type safety across frontend and backend - **ESBuild**: Production bundling for server code

- **Vite**: Frontend development server and build tool
- **Drizzle Kit**: Database migration and schema management
## Deployment Strategy
### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite dev server with HMR for frontend changes
- **Database**: Provisioned PostgreSQL instance via Replit modules
- **Port Configuration**: Frontend (Vite) and backend (Express) on port 5000
### Production Build
- **Build Process**: `npm run build` creates optimized frontend and server bundles
- **Static Assets**: Frontend builds to `dist/public` directory - **Server Bundle**: Express server bundled with esbuild
- **Deployment Target**: Replit autoscale deployment
### Environment Configuration
- **Database URL**: Required environment variable for PostgreSQL connection
- **Build Commands**: Separate build steps for frontend (Vite) and backend (esbuild)
- **Start Command**: Production server serves static files and API routes
