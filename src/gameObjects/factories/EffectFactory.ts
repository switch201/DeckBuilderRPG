import { Effect, type EffectProps } from '../Effect';
import type { EffectType, TargetType, EffectProperties } from '../Effect';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';

export interface EffectData extends GameObjectData {
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
    async createFromJson(data: EffectData): Promise<Effect> {
        this.validateBaseData(data);
        this.validateEffectData(data);

        const properties: EffectProperties = {
            value: data.value,
            target: data.target,
            properties: data.properties,
            tags: data.tags
        };

        return new Effect({
            id: data.id,
            name: data.name,
            description: data.description,
            effectType: data.type,
            properties
        });
    }

    private validateEffectData(data: EffectData): void {
        if (typeof data.value !== 'number') {
            throw new Error('Effect data must have a numeric value');
        }
        if (!this.isValidTargetType(data.target)) {
            throw new Error('Effect data must have a valid target type');
        }
        if (!Array.isArray(data.properties)) {
            throw new Error('Effect data must have a properties array');
        }
        if (!Array.isArray(data.tags)) {
            throw new Error('Effect data must have a tags array');
        }
    }

    private isValidTargetType(target: string): target is TargetType {
        return ['single', 'all', 'random', 'self'].includes(target);
    }
} 