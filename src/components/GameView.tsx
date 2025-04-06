import React, { useState } from 'react';
import { GameState } from '../gameState/GameState';
import { GameObject } from '../gameObjects/GameObject';
import { CollectibleObject } from '../gameObjects/InteractiveObject';
import { NPC } from '../gameObjects/NPC';
import { MiniMap } from './MiniMap';

interface GameViewProps {
    gameState: GameState;
}

export const GameView: React.FC<GameViewProps> = ({ gameState }) => {
    const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInspect = (objectId: string) => {
        const object = gameState.inspectObject(objectId);
        if (object) {
            setSelectedObject(object);
        }
    };

    const handleTake = (objectId: string) => {
        if (gameState.takeObject(objectId)) {
            // Clear selection if we just took the selected object
            if (selectedObject?.id === objectId) {
                setSelectedObject(null);
            }
        }
    };

    const handleMove = async (targetRoomId: string) => {
        try {
            setIsLoading(true);
            setError(null);
            const success = await gameState.moveToRoom(targetRoomId);
            if (success) {
                setSelectedObject(null);
            } else {
                setError('Failed to move to the room');
            }
        } catch (err) {
            setError('An error occurred while moving to the room');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const currentRoom = gameState.currentRoom;
    const inventory = gameState.inventory;

    if (isLoading) {
        return (
            <div className="game-view loading">
                <div className="loading-spinner" />
                <p>Loading room...</p>
            </div>
        );
    }

    return (
        <div className="game-view">
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>Dismiss</button>
                </div>
            )}

            <div className="game-container">
                <div className="game-main-area">
                    <div className="room-info">
                        <h2>{currentRoom.name}</h2>
                        <p>{currentRoom.description}</p>
                    </div>

                    <div className="room-exits">
                        <h3>Available Exits:</h3>
                        <div className="exit-buttons">
                            {currentRoom.visibleExits.map(exit => (
                                <button
                                    key={exit.direction}
                                    onClick={() => handleMove(exit.targetRoomId)}
                                    disabled={exit.isLocked || isLoading}
                                >
                                    Go {exit.direction}
                                    {exit.description && ` (${exit.description})`}
                                    {exit.isLocked && ' (Locked)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="room-npcs">
                        <h3>Characters:</h3>
                        <div className="npc-list">
                            {currentRoom.npcs.map(npc => (
                                <div key={npc.id} className="npc-item">
                                    <div className="npc-info">
                                        <span className="npc-name">{npc.name}</span>
                                        <span className="npc-type">{npc.type}</span>
                                        <span className="npc-level">Level {npc.level}</span>
                                    </div>
                                    <div className="npc-actions">
                                        <button 
                                            onClick={() => handleInspect(npc.id)}
                                            disabled={isLoading}
                                        >
                                            Inspect
                                        </button>
                                        {npc.type === 'merchant' && (
                                            <button disabled={isLoading}>
                                                Trade
                                            </button>
                                        )}
                                        {npc.type === 'quest_giver' && (
                                            <button disabled={isLoading}>
                                                Talk
                                            </button>
                                        )}
                                        {npc.type === 'enemy' && (
                                            <button disabled={isLoading}>
                                                Attack
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="room-objects">
                        <h3>Objects:</h3>
                        <div className="object-list">
                            {currentRoom.containedObjects.map(obj => (
                                <div key={obj.id} className="object-item">
                                    <span>{obj.name}</span>
                                    <div className="object-actions">
                                        <button 
                                            onClick={() => handleInspect(obj.id)}
                                            disabled={isLoading}
                                        >
                                            Inspect
                                        </button>
                                        {obj instanceof CollectibleObject && (
                                            <button 
                                                onClick={() => handleTake(obj.id)}
                                                disabled={isLoading}
                                            >
                                                Take
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="game-sidebar">
                    <MiniMap gameState={gameState} onRoomClick={handleMove} />
                    
                    <div className="inventory">
                        <h3>Inventory:</h3>
                        <div className="object-list">
                            {inventory.map(item => (
                                <div key={item.id} className="object-item">
                                    <span>{item.name}</span>
                                    <button 
                                        onClick={() => handleInspect(item.id)}
                                        disabled={isLoading}
                                    >
                                        Inspect
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {selectedObject && (
                <div className="inspection-panel">
                    <h3>Inspecting: {selectedObject.name}</h3>
                    <p>{selectedObject.description}</p>
                    {selectedObject instanceof CollectibleObject && (
                        <div className="object-stats">
                            <p>Weight: {selectedObject.weight}</p>
                            <p>Value: {selectedObject.value}</p>
                        </div>
                    )}
                    {selectedObject instanceof NPC && (
                        <div className="npc-stats">
                            <p>Type: {selectedObject.type}</p>
                            <p>Level: {selectedObject.level}</p>
                            <p>Behavior: {selectedObject.behavior}</p>
                            <div className="combat-stats">
                                <p>Health: {selectedObject.stats.health}</p>
                                <p>Energy: {selectedObject.stats.energy}</p>
                                <p>Strength: {selectedObject.stats.strength}</p>
                                <p>Defense: {selectedObject.stats.defense}</p>
                            </div>
                            {selectedObject.type === 'merchant' && (
                                <p>Gold: {selectedObject.gold}</p>
                            )}
                        </div>
                    )}
                    <button 
                        onClick={() => setSelectedObject(null)}
                        disabled={isLoading}
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
    );
}; 