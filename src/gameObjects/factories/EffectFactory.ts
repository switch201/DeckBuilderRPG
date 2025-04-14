import { Effect, type EffectProps, type EffectType, type TargetType } from '../Effect';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';

export type EffectData = GameObjectData & {
    type: EffectType;
    value: number;
    target: TargetType;
    properties: string[];
    tags: string[];
}

/**
 * Factory for creating effects from JSON data
 */
export class EffectFactory extends BaseGameObjectFactory<Effect, EffectData> {
    isValidData(data: GameObjectData): data is EffectData {
        return (
            'type' in data &&
            'value' in data &&
            'target' in data &&
            'properties' in data &&
            'tags' in data
        );
    }

    private isValidEffectType(type: unknown): type is EffectType {
        return typeof type === 'string' && ['damage', 'defense', 'buff', 'debuff', 'heal'].includes(type);
    }

    private isValidTargetType(target: unknown): target is TargetType {
        return typeof target === 'string' && ['single', 'all', 'random', 'self'].includes(target);
    }

    async createFromJson(data: unknown): Promise<Effect> {
        if (!this.isValidGameObjectData(data) || !this.isValidData(data)) {
            throw new Error('Invalid effect data');
        }

        return new Effect({
            id: data.id,
            name: data.name,
            description: data.description,
            effectType: data.type,
            properties: {
                value: data.value,
                target: data.target,
                properties: data.properties,
                tags: data.tags
            }
        });
    }
} 