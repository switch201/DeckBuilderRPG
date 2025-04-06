import { Card } from '../Card';
import type { CardType, CardProperties } from '../Card';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { EffectFactory } from './EffectFactory';
import { ContentLoader } from '../content/ContentLoader';

export interface CardData extends GameObjectData {
    type: CardType;
    energyCost: number;
    effectIds: string[];
    tags: string[];
}

/**
 * Factory for creating cards from JSON data
 */
export class CardFactory extends BaseGameObjectFactory<Card, CardData> {
    private readonly effectFactory: EffectFactory;
    private readonly contentLoader: ContentLoader;

    constructor(contentLoader: ContentLoader) {
        super();
        this.contentLoader = contentLoader;
        this.effectFactory = new EffectFactory();
    }

    async createFromJson(data: CardData): Promise<Card> {
        this.validateBaseData(data);
        this.validateCardData(data);

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

        return new Card(
            data.id,
            data.name,
            data.description,
            data.type,
            properties
        );
    }

    private validateCardData(data: CardData): void {
        if (typeof data.energyCost !== 'number' || data.energyCost < 0) {
            throw new Error('Card data must have a valid energyCost (>= 0)');
        }
        if (!Array.isArray(data.effectIds)) {
            throw new Error('Card data must have an effectIds array');
        }
        if (!Array.isArray(data.tags)) {
            throw new Error('Card data must have a tags array');
        }
        if (!this.isValidCardType(data.type)) {
            throw new Error('Card data must have a valid type');
        }
    }

    private isValidCardType(type: string): type is CardType {
        return ['attack', 'defense', 'skill', 'power'].includes(type);
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