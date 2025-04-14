import type { GameObject } from '../GameObject';

/**
 * Base type for game object JSON data
 */
export type GameObjectData = {
    id: string;
    name: string;
    description: string;
    type: string;
}

/**
 * Abstract factory for creating game objects from JSON data
 */
export abstract class BaseGameObjectFactory<T extends GameObject, D extends GameObjectData> {
    /**
     * Create a game object from JSON data
     */
    abstract createFromJson(data: D): Promise<T>;

    /**
     * Type guard that checks if the data matches the specific derived type
     * Implement this in derived classes to add additional type checks
     */
    abstract isValidData(data: GameObjectData): data is D;

    /**
     * Type guard that checks if the data has all required base fields and then checks specific type
     */
    protected isValidGameObjectData(data: unknown): data is GameObjectData {
        if (!data || typeof data !== 'object') return false;
        const d = data as Record<string, unknown>;
        
        // Check base GameObjectData fields
        if (!(
            typeof d.id === 'string' && d.id.length > 0 &&
            typeof d.name === 'string' && d.name.length > 0 &&
            typeof d.description === 'string' && d.description.length > 0 &&
            typeof d.type === 'string' && d.type.length > 0
        )) {
            return false;
        }
        return true;
    }
} 