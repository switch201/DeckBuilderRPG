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
     * Validate that the JSON data has all required fields
     */
    protected validateBaseData(data: GameObjectData): void {
        if (!data.id) throw new Error('Game object data must have an id');
        if (!data.name) throw new Error('Game object data must have a name');
        if (!data.description) throw new Error('Game object data must have a description');
        if (!data.type) throw new Error('Game object data must have a type');
    }
} 