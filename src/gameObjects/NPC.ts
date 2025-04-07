import { GameObject, type GameObjectProps, type GameObjectType } from './GameObject';
import type { Card } from './Card';

export type NPCBehavior = 'friendly' | 'neutral' | 'hostile';

export type NPCStats = {
    health: number;
    energy: number;
    strength: number;
    defense: number;
}

export type NPCProps = GameObjectProps & {
    behavior: NPCBehavior;
    stats: NPCStats;
    level: number;
    deck?: Card[];
    tags?: string[];
    gold?: number;
}

/**
 * Represents an NPC in the game
 */
export class NPC extends GameObject {
    get type(): GameObjectType {
        return 'npc';
    }
    private _deck: Card[];
    private _tags: string[];
    private _level: number;
    private _behavior: NPCBehavior;
    private _stats: NPCStats;
    private _gold: number;

    constructor(props: NPCProps) {
        super(props);
        this._level = props.level;
        this._behavior = props.behavior;
        this._stats = props.stats;
        this._gold = props.gold || 0;
        this._deck = props.deck || [];
        this._tags = props.tags || [];
    }

    get deck(): readonly Card[] {
        return [...this._deck];
    }

    get tags(): readonly string[] {
        return [...this._tags];
    }

    get level(): number {
        return this._level;
    }

    get behavior(): NPCBehavior {
        return this._behavior;
    }

    get stats(): NPCStats {
        return {...this._stats};
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