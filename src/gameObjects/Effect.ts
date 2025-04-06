import { GameObject } from './GameObject';

export type EffectType = 'damage' | 'defense' | 'buff' | 'debuff' | 'heal';
export type TargetType = 'single' | 'all' | 'random' | 'self';

export interface EffectProperties {
    value: number;
    target: TargetType;
    properties: string[];
    tags: string[];
}

/**
 * Represents an effect that can be applied by cards
 */
export class Effect extends GameObject {
    private readonly _type: EffectType;
    private readonly _value: number;
    private readonly _target: TargetType;
    private readonly _properties: string[];
    private readonly _tags: string[];

    constructor(
        id: string,
        name: string,
        description: string,
        type: EffectType,
        properties: EffectProperties
    ) {
        super(id, name, description);
        this._type = type;
        this._value = properties.value;
        this._target = properties.target;
        this._properties = [...properties.properties];
        this._tags = [...properties.tags];
    }

    get type(): EffectType {
        return this._type;
    }

    get value(): number {
        return this._value;
    }

    get target(): TargetType {
        return this._target;
    }

    get properties(): readonly string[] {
        return this._properties;
    }

    get tags(): readonly string[] {
        return this._tags;
    }

    /**
     * Check if the effect has a specific property
     */
    hasProperty(property: string): boolean {
        return this._properties.includes(property);
    }

    /**
     * Check if the effect has a specific tag
     */
    hasTag(tag: string): boolean {
        return this._tags.includes(tag);
    }
} 