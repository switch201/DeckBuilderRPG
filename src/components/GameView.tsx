import React, { useState } from 'react';
import { GameState } from '../gameState/GameState';
import { GameObject } from '../gameObjects/GameObject';
import { MiniMap } from './MiniMap';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { RoomInfo } from './RoomInfo';
import { RoomExits } from './RoomExits';
import { NPCList } from './NPCList';
import { ObjectList } from './ObjectList';
import { InspectionPanel } from './InspectionPanel';
import RoomArt from './RoomArt';

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
        return <LoadingSpinner message="Loading room..." />;
    }

    return (
        <div className="game-view">
            {error && (
                <ErrorMessage 
                    message={error} 
                    onDismiss={() => setError(null)} 
                />
            )}

            <div className="game-main-area">
                <RoomArt 
                    roomType={currentRoom.roomType} 
                    description={currentRoom.description}
                />
                
                <RoomExits 
                    exits={currentRoom.visibleExits}
                    onMove={handleMove}
                    isLoading={isLoading}
                />

                <div className="room-content">
                    <NPCList 
                        npcs={currentRoom.npcs}
                        onInspect={handleInspect}
                        isLoading={isLoading}
                    />

                    <ObjectList 
                        objects={currentRoom.containedObjects}
                        onInspect={handleInspect}
                        onTake={handleTake}
                        isLoading={isLoading}
                    />
                </div>
            </div>
            
            <div className="side-panel">
                <div className="map-section">
                    <h3>MAP</h3>
                    <MiniMap gameState={gameState} onRoomClick={handleMove} />
                </div>
                
                <div className="inventory-section">
                    <h3>INVENTORY</h3>
                    <ObjectList 
                        objects={inventory}
                        onInspect={handleInspect}
                        isLoading={isLoading}
                        isInventory={true}
                    />
                </div>
            </div>

            <div className="message-log">
                <p>You enter the room...</p>
                <p>The torch flickers on the wall...</p>
            </div>

            {selectedObject && (
                <InspectionPanel
                    object={selectedObject}
                    onClose={() => setSelectedObject(null)}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
}; 