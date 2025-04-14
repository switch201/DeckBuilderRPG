import { Card } from '../Card';
import type { CardType, CardProperties } from '../Card';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { EffectFactory } from './EffectFactory';
import { ContentLoader } from '../content/ContentLoader';

export type CardData = GameObjectData & {
    type: CardType;
    energyCost: number;
    effectIds: string[];
    tags: string[];
}

/**
 * Factory for creating cards from JSON data
 */
export class CardFactory extends BaseGameObjectFactory<Card, CardData> {
    isValidData(data: GameObjectData): data is CardData {
        throw new Error('Method not implemented.');
    }
    private readonly effectFactory: EffectFactory;
    private readonly contentLoader: ContentLoader;

    constructor(contentLoader: ContentLoader) {
        super();
        this.contentLoader = contentLoader;
        this.effectFactory = new EffectFactory();
    }

    async createFromJson(data: unknown): Promise<Card> {
        if(!this.isValidGameObjectData(data) || !this.isValidData(data)) {
            throw new Error('Invalid card data');
        }

        // Load effects referenced by the card
        const effects = await Promise.all(data.effectIds.map(async effectId => {
            const effectData = await this.contentLoader.loadEffect(effectId);
            return this.effectFactory.createFromJson(effectData);
        }));

        const properties: CardProperties = {
            energyCost: data.energyCost,
            effects,
            tags: data.tags
        };

        return new Card({
            id: data.id,
            name: data.name,
            description: data.description,
            cardType: data.type,
            properties
        });
    }

    /**
     * Determine the type of card from the content directory structure
     */
    async determineCardType(cardId: string): Promise<string> {
        // Look in each card type directory
        const cardTypes = ['attack', 'defense', 'skill', 'power'];
        for (const type of cardTypes) {
            try {
                // Check if the card exists in this directory
                const response = await fetch(`/src/content/cards/${type}/${cardId}.json`);
                if (response.ok) {
                    return type;
                }
            } catch (e) {
                // Continue checking other directories
            }
        }
        throw new Error(`Could not determine card type for: ${cardId}`);
    }
} 