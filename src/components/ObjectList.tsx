import React from 'react';
import { GameObject } from '../gameObjects/GameObject';
import { CollectibleObject } from '../gameObjects/InteractiveObject';

interface ObjectListProps {
    objects: readonly GameObject[];
    onInspect: (id: string) => void;
    onTake?: (id: string) => void;
    isLoading: boolean;
    isInventory?: boolean;
}

export const ObjectList: React.FC<ObjectListProps> = ({ 
    objects, 
    onInspect, 
    onTake, 
    isLoading,
    isInventory = false 
}) => {
    return (
        <div className={isInventory ? "inventory" : "room-objects"}>
            <h3>{isInventory ? "Inventory:" : "Objects:"}</h3>
            <div className="object-list">
                {objects.map(obj => (
                    <div key={obj.id} className="object-item">
                        <span>{obj.name}</span>
                        <div className="object-actions">
                            <button 
                                onClick={() => onInspect(obj.id)}
                                disabled={isLoading}
                            >
                                Inspect
                            </button>
                            {!isInventory && obj instanceof CollectibleObject && onTake && (
                                <button 
                                    onClick={() => onTake(obj.id)}
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
    );
}; 