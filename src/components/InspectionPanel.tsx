import React from 'react';
import { GameObject } from '../gameObjects/GameObject';
import { CollectibleObject } from '../gameObjects/InteractiveObject';
import { NPC } from '../gameObjects/NPC';

interface InspectionPanelProps {
    object: GameObject;
    onClose: () => void;
    isLoading: boolean;
}

export const InspectionPanel: React.FC<InspectionPanelProps> = ({ object, onClose, isLoading }) => {
    return (
        <div className="inspection-panel">
            <h3>Inspecting: {object.name}</h3>
            <p>{object.description}</p>
            {object instanceof CollectibleObject && (
                <div className="object-stats">
                    <p>Weight: {object.weight}</p>
                    <p>Value: {object.value}</p>
                </div>
            )}
            {object instanceof NPC && (
                <div className="npc-stats">
                    <p>Type: {object.type}</p>
                    <p>Level: {object.level}</p>
                    <p>Behavior: {object.behavior}</p>
                    <div className="combat-stats">
                        <p>Health: {object.stats.health}</p>
                        <p>Energy: {object.stats.energy}</p>
                        <p>Strength: {object.stats.strength}</p>
                        <p>Defense: {object.stats.defense}</p>
                    </div>
                    {object.type === 'npc' && (
                        <p>Gold: {object.gold}</p>
                    )}
                </div>
            )}
            <button 
                onClick={onClose}
                disabled={isLoading}
            >
                Close
            </button>
        </div>
    );
}; 