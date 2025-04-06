import { GameObject } from './GameObject';
import type { Card } from './Card';

export type NPCType = 'enemy' | 'merchant' | 'quest_giver' | 'neutral';
export type NPCBehavior = 'aggressive' | 'defensive' | 'supportive' | 'random';

export interface NPCStats {
    health: number;
    energy: number;
    strength: number;
    defense: number;
}

export interface NPCProperties {
    type: NPCType;
    behavior: NPCBehavior;
    stats: NPCStats;
    level: number;
    deck: Card[];
    tags: string[];
    gold?: number; // Optional, mainly for merchants or lootable NPCs
}

/**
 * Represents an NPC in the game
 */
export class NPC extends GameObject {
    private readonly _type: NPCType;
    private readonly _behavior: NPCBehavior;
    private readonly _stats: NPCStats;
    private readonly _level: number;
    private readonly _deck: Card[];
    private readonly _tags: string[];
    private readonly _gold: number;

    constructor(
        id: string,
        name: string,
        description: string,
        properties: NPCProperties
    ) {
        super(id, name, description);
        this._type = properties.type;
        this._behavior = properties.behavior;
        this._stats = { ...properties.stats };
        this._level = properties.level;
        this._deck = [...properties.deck];
        this._tags = [...properties.tags];
        this._gold = properties.gold ?? 0;
    }

    get type(): NPCType {
        return this._type;
    }

    get behavior(): NPCBehavior {
        return this._behavior;
    }

    get stats(): Readonly<NPCStats> {
        return { ...this._stats };
    }

    get level(): number {
        return this._level;
    }

    get deck(): readonly Card[] {
        return [...this._deck];
    }

    get tags(): readonly string[] {
        return [...this._tags];
    }

    get gold(): number {
        return this._gold;
    }

    /**
     * Check if the NPC has a specific tag
     */
    hasTag(tag: string): boolean {
        return this._tags.includes(tag);
    }

    /**
     * Get a copy of the NPC's deck
     */
    getDeck(): Card[] {
        return [...this._deck];
    }
} 