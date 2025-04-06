import React, { useState, useEffect } from 'react';
import { GameView } from './components/GameView';
import { GameState } from './gameState/GameState';
import { GameContentManager } from './gameObjects/factories/GameObjectFactory';
import './styles/GameView.css';
import './styles/MiniMap.css';

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initGame = async () => {
            try {
                setIsInitializing(true);
                setError(null);
                const contentManager = await GameContentManager.getInstance();
                const startRoom = await contentManager.loadRoom('start');
                const state = await GameState.create(startRoom);
                setGameState(state);
            } catch (err) {
                console.error('Failed to initialize game:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize game. Please try refreshing the page.');
            } finally {
                setIsInitializing(false);
            }
        };

        initGame();
    }, []);

    if (error) {
        return (
            <div className="game-view error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Refresh Page
                </button>
            </div>
        );
    }

    if (isInitializing || !gameState) {
        return (
            <div className="game-view loading">
                <div className="loading-spinner" />
                <p>Loading game...</p>
            </div>
        );
    }

    return <GameView gameState={gameState} />;
};

export default App; 