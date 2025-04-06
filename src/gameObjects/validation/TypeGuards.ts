import type { GameObjectData } from '../factories/GameObjectFactory';
import type { InteractiveObjectData } from '../factories/InteractiveObjectFactory';

/**
 * Type guard for checking if a value is a Record<string, unknown>
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Type guard for basic GameObjectData
 */
export function isGameObjectData(data: unknown): data is GameObjectData {
    if (!isRecord(data)) return false;

    return (
        typeof data.id === 'string' &&
        typeof data.name === 'string' &&
        typeof data.description === 'string' &&
        typeof data.type === 'string'
    );
}

/**
 * Type guard for interaction data in JSON
 */
export function isInteractionData(data: unknown): data is { name: string; description: string } {
    if (!isRecord(data)) return false;

    return (
        typeof data.name === 'string' &&
        typeof data.description === 'string'
    );
}

/**
 * Type guard for InteractiveObjectData
 */
export function isInteractiveObjectData(data: unknown): data is InteractiveObjectData {
    if (!isGameObjectData(data)) return false;

    if ('interactions' in data) {
        if (!Array.isArray(data.interactions)) return false;
        return data.interactions.every(isInteractionData);
    }

    return true;
} 