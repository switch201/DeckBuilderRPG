import React from 'react';
import { NPC } from '../gameObjects/NPC';

type NPCListProps = {
    npcs: readonly NPC[];
    onInspect: (id: string) => void;
    isLoading: boolean;
}

export const NPCList: React.FC<NPCListProps> = ({ npcs, onInspect, isLoading }) => {
    if (!npcs || npcs.length === 0) {
        return (
            <div className="room-npcs">
                <h3>Characters:</h3>
                <div className="npc-list">
                    <p>No characters in this area.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="room-npcs">
            <h3>Characters:</h3>
            <div className="npc-list">
                {npcs.map(npc => (
                    <div key={npc.id} className="npc-item">
                        <div className="npc-info">
                            <div className="npc-name">{npc.name || 'Unknown'}</div>
                            <div className="npc-details">
                                <span>Type: {npc.type || 'Unknown'}</span>
                                <span>Level: {npc.level || '?'}</span>
                            </div>
                        </div>
                        <div className="npc-actions">
                            <button
                                onClick={() => onInspect(npc.id)}
                                disabled={isLoading}
                            >
                                Inspect
                            </button>

                            <button disabled={isLoading}>
                                Trade
                            </button>


                            <button disabled={isLoading}>
                                Talk
                            </button>


                            <button disabled={isLoading}>
                                Attack
                            </button>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 