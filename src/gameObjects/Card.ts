import type { Effect } from './Effect';
import { GameObject, type GameObjectProps, type GameObjectType } from './GameObject';

export type CardType = 'attack' | 'defense' | 'skill' | 'power';

export type CardProperties = {
    energyCost: number;
    effects: Effect[];
    tags: string[];
}

export type CardProps = GameObjectProps & {
    cardType: CardType;
    properties: CardProperties;
}

/**
 * Represents a playable card in the game
 */
export class Card extends GameObject {
    private readonly _type: CardType;
    private readonly _energyCost: number;
    private readonly _effects: Effect[];
    private readonly _tags: string[];

    constructor(props: CardProps) {
        super(props);
        this._type = props.cardType;
        this._energyCost = props.properties.energyCost;
        this._effects = [...props.properties.effects];
        this._tags = [...props.properties.tags];
    }

    get type(): GameObjectType {
        return 'card';
    }

    get cardType(): CardType {
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