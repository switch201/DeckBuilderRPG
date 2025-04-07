import { InteractiveObject } from '../InteractiveObject';
import type { Interaction } from '../interactions/Interaction';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { isInteractiveObjectData } from '../validation/TypeGuards';

/**
 * JSON data for interactive objects
 */
export interface InteractiveObjectData extends GameObjectData {
    interactions?: {
        name: string;
        description: string;
        // Note: execute function will need to be provided separately
        // as JSON cannot contain functions
    }[];
}

/**
 * Factory for creating interactive objects from JSON data
 */
export class InteractiveObjectFactory extends BaseGameObjectFactory<InteractiveObject, InteractiveObjectData> {
    private readonly _interactionHandlers: Map<string, () => void>;

    constructor() {
        super();
        this._interactionHandlers = new Map();
    }

    /**
     * Register a handler for a specific interaction
     */
    registerInteractionHandler(name: string, handler: () => void): void {
        this._interactionHandlers.set(name, handler);
    }

    /**
     * Create an interactive object from JSON data
     */
    async createFromJson(data: InteractiveObjectData): Promise<InteractiveObject> {
        const obj = new InteractiveObject({
            id: data.id,
            name: data.name,
            description: data.description
        });
        
        // Add any interactions defined in the JSON
        if (data.interactions) {
            for (const intData of data.interactions) {
                const handler = this._interactionHandlers.get(intData.name);
                if (!handler) {
                    throw new Error(`No handler registered for interaction: ${intData.name}`);
                }

                const interaction: Interaction = {
                    name: intData.name,
                    description: intData.description,
                    execute: handler
                };
                
                obj.addInteraction(interaction);
            }
        }
        
        return obj;
    }
} 