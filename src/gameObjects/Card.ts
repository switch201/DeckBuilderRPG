import type { Effect } from './Effect';
import { GameObject } from './GameObject';

export type CardType = 'attack' | 'defense' | 'skill' | 'power';

export interface CardProperties {
    energyCost: number;
    effects: Effect[];
    tags: string[];
}

/**
 * Represents a playable card in the game
 */
export class Card extends GameObject {
    private readonly _type: CardType;
    private readonly _energyCost: number;
    private readonly _effects: Effect[];
    private readonly _tags: string[];

    constructor(
        id: string,
        name: string,
        description: string,
        type: CardType,
        properties: CardProperties
    ) {
        super(id, name, description);
        this._type = type;
        this._energyCost = properties.energyCost;
        this._effects = [...properties.effects];
        this._tags = [...properties.tags];
    }

    get type(): CardType {
        return this._type;
    }

    get energyCost(): number {
        return this._energyCost;
    }

    get effects(): readonly Effect[] {
        return this._effects;
    }

    get tags(): readonly string[] {
        return this._tags;
    }

    /**
     * Check if the card has a specific tag
     */
    hasTag(tag: string): boolean {
        return this._tags.includes(tag);
    }

    /**
     * Check if the card has all of the specified tags
     */
    hasAllTags(tags: string[]): boolean {
        return tags.every(tag => this._tags.includes(tag));
    }

    /**
     * Check if the card has any of the specified tags
     */
    hasAnyTag(tags: string[]): boolean {
        return tags.some(tag => this._tags.includes(tag));
    }
} 