import { NPC, type NPCBehavior, type NPCProps, type NPCStats } from '../NPC';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { CardFactory } from './CardFactory';
import { ContentLoader } from '../content/ContentLoader';

export interface NPCData extends GameObjectData {
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

        return new NPC({
            id: data.id,
            name: data.name,
            description: data.description,
            level: data.level,
            behavior: data.behavior,
            stats: data.stats,
            gold: data.gold ?? 0,
            deck: deck,
            tags: data.tags
        });
    }

    private validateNPCData(data: NPCData): void {
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

    private isValidNPCBehavior(behavior: string): behavior is NPCBehavior {
        return ['friendly', 'neutral', 'hostile', 'merchant', 'quest_giver', 'enemy', 'supportive', 'defensive', 'aggressive', 'random'].includes(behavior);
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