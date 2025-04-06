import { NPC } from '../NPC';
import type { NPCType, NPCBehavior, NPCStats, NPCProperties } from '../NPC';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { CardFactory } from './CardFactory';
import { ContentLoader } from '../content/ContentLoader';

export interface NPCData extends GameObjectData {
    type: NPCType;
    behavior: NPCBehavior;
    stats: NPCStats;
    level: number;
    cardIds: string[]; // References to card IDs in the content directory
    tags: string[];
    gold?: number;
}

/**
 * Factory for creating NPCs from JSON data
 */
export class NPCFactory extends BaseGameObjectFactory<NPC, NPCData> {
    private readonly cardFactory: CardFactory;
    private readonly contentLoader: ContentLoader;

    constructor(contentLoader: ContentLoader) {
        super();
        this.contentLoader = contentLoader;
        this.cardFactory = new CardFactory(contentLoader);
    }

    async createFromJson(data: NPCData): Promise<NPC> {
        this.validateBaseData(data);
        this.validateNPCData(data);

        // Load cards referenced by the NPC
        const deck = await Promise.all(data.cardIds.map(async cardId => {
            const cardData = await this.contentLoader.loadCard(cardId);
            return this.cardFactory.createFromJson(cardData);
        }));

        const properties: NPCProperties = {
            type: data.type,
            behavior: data.behavior,
            stats: { ...data.stats },
            level: data.level,
            deck,
            tags: [...data.tags],
            gold: data.gold ?? 0 // Convert undefined to 0
        };

        return new NPC(
            data.id,
            data.name,
            data.description,
            properties
        );
    }

    private validateNPCData(data: NPCData): void {
        if (!this.isValidNPCType(data.type)) {
            throw new Error('NPC data must have a valid type');
        }
        if (!this.isValidNPCBehavior(data.behavior)) {
            throw new Error('NPC data must have a valid behavior');
        }
        if (!this.isValidStats(data.stats)) {
            throw new Error('NPC data must have valid stats');
        }
        if (typeof data.level !== 'number' || data.level < 1) {
            throw new Error('NPC data must have a valid level (>= 1)');
        }
        if (!Array.isArray(data.cardIds)) {
            throw new Error('NPC data must have a cardIds array');
        }
        if (!Array.isArray(data.tags)) {
            throw new Error('NPC data must have a tags array');
        }
        if (data.gold !== undefined && typeof data.gold !== 'number') {
            throw new Error('NPC gold must be a number if specified');
        }
    }

    private isValidNPCType(type: string): type is NPCType {
        return ['enemy', 'merchant', 'quest_giver', 'neutral'].includes(type);
    }

    private isValidNPCBehavior(behavior: string): behavior is NPCBehavior {
        return ['aggressive', 'defensive', 'supportive', 'random'].includes(behavior);
    }

    private isValidStats(stats: unknown): stats is NPCStats {
        if (!stats || typeof stats !== 'object') return false;
        const s = stats as NPCStats;
        return (
            typeof s.health === 'number' &&
            typeof s.energy === 'number' &&
            typeof s.strength === 'number' &&
            typeof s.defense === 'number'
        );
    }
} 