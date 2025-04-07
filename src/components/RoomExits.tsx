import React from 'react';
import type { Exit } from '../gameObjects/Room';

interface RoomExitsProps {
    exits: readonly Exit[];
    onMove: (targetRoomId: string) => void;
    isLoading: boolean;
}

export const RoomExits: React.FC<RoomExitsProps> = ({ exits, onMove, isLoading }) => {
    return (
        <div className="room-exits">
            <h3>Available Exits:</h3>
            <div className="exit-buttons">
                {exits.map(exit => (
                    <button
                        key={exit.direction}
                        onClick={() => onMove(exit.targetRoomId)}
                        disabled={exit.isLocked || isLoading}
                    >
                        Go {exit.direction}
                        {exit.description && ` (${exit.description})`}
                        {exit.isLocked && ' (Locked)'}
                    </button>
                ))}
            </div>
        </div>
    );
}; 