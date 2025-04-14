import { NPC, type NPCBehavior, type NPCProps, type NPCStats } from '../NPC';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { CardFactory } from './CardFactory';
import { ContentLoader } from '../content/ContentLoader';

export type NPCData = GameObjectData & {
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
    isValidData(data: GameObjectData): data is NPCData {
        return (
            'behavior' in data &&
            'stats' in data &&
            'level' in data &&
            'cardIds' in data &&
            'tags' in data &&
            Array.isArray(data.cardIds) &&
            Array.isArray(data.tags)
        );
    }
    private readonly cardFactory: CardFactory;
    private readonly contentLoader: ContentLoader;

    constructor(contentLoader: ContentLoader) {
        super();
        this.contentLoader = contentLoader;
        this.cardFactory = new CardFactory(contentLoader);
    }

    async createFromJson(data: unknown): Promise<NPC> {
        if(!this.isValidGameObjectData(data) || !this.isValidData(data)) {
            throw new Error('Invalid NPC data');
        }

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
} 