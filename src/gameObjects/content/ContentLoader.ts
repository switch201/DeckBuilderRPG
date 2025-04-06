import type { GameObjectData } from '../factories/BaseGameObjectFactory';
import type { Interaction } from '../interactions/Interaction';
import { BasicInteraction } from '../interactions/BasicInteraction';
import type { EffectData } from '../factories/EffectFactory';
import type { CardData } from '../factories/CardFactory';

interface InteractionData {
    name: string;
    description: string;
}

/**
 * Handles loading and resolving content from JSON files
 */
export class ContentLoader {
    private readonly _interactions: Map<string, Interaction>;
    private readonly _gameObjects: Map<string, GameObjectData>;
    private readonly contentBasePath: string;
    private _isLoaded: boolean = false;

    constructor(contentBasePath: string = 'src/content') {
        this._interactions = new Map();
        this._gameObjects = new Map();
        this.contentBasePath = contentBasePath;
        
        // Load interactions immediately
        this.loadInteractions().catch(error => {
            console.error('Failed to load interactions:', error);
        });
    }

    /**
     * Check if interactions have been loaded
     */
    isLoaded(): boolean {
        return this._isLoaded;
    }

    /**
     * Load interactions from the interactions.json file
     */
    private async loadInteractions(): Promise<void> {
        try {
            console.log('Loading interactions from:', `${this.contentBasePath}/interactions/interactions.json`);
            const response = await fetch(`${this.contentBasePath}/interactions/interactions.json`);
            if (!response.ok) {
                throw new Error(`Failed to load interactions: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Loaded interactions data:', data);

            for (const [key, interactionData] of Object.entries<InteractionData>(data)) {
                console.log(`Creating interaction: ${key}`, interactionData);
                const interaction = new BasicInteraction(interactionData.name, interactionData.description);
                this._interactions.set(key, interaction);
            }

            console.log('Loaded interactions:', Array.from(this._interactions.keys()));
            this._isLoaded = true;
        } catch (error) {
            console.error('Error loading interactions:', error);
            throw error;
        }
    }

    /**
     * Load all content from the Content directory
     */
    async loadAllContent(): Promise<void> {
        // Load all game objects
        await this.loadGameObjects();
    }

    /**
     * Load all game objects from their respective directories
     */
    private async loadGameObjects(): Promise<void> {
        const directories = ['rooms', 'scenery', 'items', 'npcs'];
        
        for (const dir of directories) {
            const files = await this.getJsonFilesInDirectory(`Content/${dir}`);
            for (const file of files) {
                const data = await this.loadJsonFile<GameObjectData>(file);
                this._gameObjects.set(data.id, data);
            }
        }
    }

    /**
     * Get a game object by ID
     */
    getGameObject(id: string): GameObjectData | undefined {
        return this._gameObjects.get(id);
    }

    /**
     * Resolve interaction references to actual interaction objects
     */
    resolveInteractions(interactionIds: string[]): Interaction[] {
        return interactionIds.map(id => {
            const interaction = this._interactions.get(id);
            if (!interaction) {
                console.error('Available interactions:', Array.from(this._interactions.keys()));
                throw new Error(`Unknown interaction: ${id}`);
            }
            return interaction;
        });
    }

    /**
     * Load a JSON file
     */
    private async loadJsonFile<T>(path: string): Promise<T> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.statusText}`);
        }
        return response.json();
    }

    /**
     * Get all JSON files in a directory
     */
    private async getJsonFilesInDirectory(path: string): Promise<string[]> {
        try {
            // Browser environments can't list directory contents directly
            // Instead, we'll use a hardcoded list of known files based on directory path
            const knownFiles: Record<string, string[]> = {
                'cards/skill': ['basic_trade.json', 'basic_heal.json', 'inspire.json', 'healing_word.json', 'dodge.json', 'quick_escape.json', 'smoke_bomb.json'],
                'cards/power': ['basic_power.json', 'protective_ward.json', 'bless.json', 'goblin_rage.json'],
                'cards/weapon': ['basic_weapon.json', 'cut.json', 'stab.json', 'parry.json'],
                'effects/interaction': ['trade_effect.json'],
                'effects/healing': ['heal_effect.json', 'regenerate_effect.json'],
                'effects/buff': ['strength_effect.json', 'dexterity_effect.json', 'gain_evasion.json'],
                'effects/damage': ['fire_damage.json', 'physical_damage.json'],
                'effects/defense': ['shield_effect.json', 'armor_effect.json', 'block.json', 'counter.json', 'smoke_cloud.json']
            };

            // If we have a predefined list for this path, use it
            if (knownFiles[path]) {
                return knownFiles[path].map(file => `${this.contentBasePath}/${path}/${file}`);
            }

            // Try fetching a manifest file that lists contents for this directory
            try {
                const manifestPath = `${this.contentBasePath}/${path}/manifest.json`;
                const response = await fetch(manifestPath);
                if (response.ok) {
                    const manifest = await response.json() as string[];
                    return manifest.map(file => `${this.contentBasePath}/${path}/${file}`);
                }
            } catch (manifestError) {
                console.warn(`No manifest found for ${path}`);
            }

            // If no known files or manifest, try a direct request for a specific file
            // This assumes the file is being requested by name later in the code
            return [];
        } catch (error) {
            console.error(`Failed to list files in ${path}:`, error);
            return [];
        }
    }

    /**
     * Load effect data from the content directory
     */
    async loadEffect(effectId: string): Promise<EffectData> {
        try {
            // Handle special cases where filename doesn't match ID
            if (effectId === 'basic_block') {
                const effectPath = `${this.contentBasePath}/effects/defense/block.json`;
                const response = await fetch(effectPath);
                if (response.ok) {
                    const effectData = await response.json() as Record<string, unknown>;
                    if (this.isEffectData(effectData)) {
                        return effectData;
                    }
                }
            }
            
            if (effectId === 'basic_counter') {
                const effectPath = `${this.contentBasePath}/effects/defense/counter.json`;
                const response = await fetch(effectPath);
                if (response.ok) {
                    const effectData = await response.json() as Record<string, unknown>;
                    if (this.isEffectData(effectData)) {
                        return effectData;
                    }
                }
            }

            // 1. First try to determine the type based on known effect types
            const effectType = await this.determineEffectType(effectId);
            
            if (effectType) {
                // Try to load from the determined type directory
                const effectPath = `${this.contentBasePath}/effects/${effectType}/${effectId}.json`;
                try {
                    const response = await fetch(effectPath);
                    if (response.ok) {
                        const effectData = await response.json() as Record<string, unknown>;
                        if (this.isEffectData(effectData)) {
                            return effectData;
                        }
                    }
                } catch (err) {
                    console.warn(`Error loading effect from determined type: ${err}`);
                }
            }

            // 2. If type determination failed, try each effect type systematically
            const effectTypes = ['interaction', 'buff', 'defense', 'damage', 'healing'];
            
            for (const type of effectTypes) {
                try {
                    const effectPath = `${this.contentBasePath}/effects/${type}/${effectId}.json`;
                    const response = await fetch(effectPath);
                    if (response.ok) {
                        const effectData = await response.json() as Record<string, unknown>;
                        if (this.isEffectData(effectData)) {
                            return effectData;
                        }
                    }
                } catch (error) {
                    // Continue to next type
                }
            }
            
            // 3. If all above attempts fail, try a direct path as fallback
            try {
                const directPath = `${this.contentBasePath}/effects/${effectId}.json`;
                const response = await fetch(directPath);
                if (response.ok) {
                    const effectData = await response.json() as Record<string, unknown>;
                    if (this.isEffectData(effectData)) {
                        return effectData;
                    }
                }
            } catch (error) {
                // Fall through to error
            }
            
            throw new Error(`Effect ${effectId} not found in any effects directory`);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to load effect ${effectId}: ${message}`);
        }
    }

    /**
     * Determine the type of effect from the content directory structure
     */
    private async determineEffectType(effectId: string): Promise<string | null> {
        // 1. Known effect type mappings - for quick lookups without network requests
        const knownEffectTypes: Record<string, string> = {
            'trade_effect': 'interaction',
            'heal_effect': 'healing',
            'regenerate_effect': 'healing',
            'strength_effect': 'buff',
            'dexterity_effect': 'buff',
            'gain_evasion': 'buff',
            'fire_damage': 'damage',
            'physical_damage': 'damage',
            'shield_effect': 'defense',
            'armor_effect': 'defense',
            'basic_block': 'defense',
            'basic_counter': 'defense',
            'smoke_cloud': 'defense'
        };

        // Check if we already know this effect's type
        if (knownEffectTypes[effectId]) {
            return knownEffectTypes[effectId];
        }

        // 2. Try to infer from naming convention
        if (effectId.includes('_damage')) return 'damage';
        if (effectId.includes('_buff') || effectId.includes('_boost')) return 'buff';
        if (effectId.includes('_heal') || effectId.includes('_regen')) return 'healing';
        if (effectId.includes('_shield') || effectId.includes('_armor') || 
            effectId.includes('_block') || effectId.includes('_guard') ||
            effectId.includes('_counter') || effectId.includes('_defend')) return 'defense';
        if (effectId.includes('_interact') || effectId.includes('_trade')) return 'interaction';

        // 3. Try direct file access to each type folder
        const effectTypes = ['interaction', 'buff', 'defense', 'damage', 'healing'];
        
        for (const type of effectTypes) {
            try {
                const response = await fetch(`${this.contentBasePath}/effects/${type}/${effectId}.json`);
                if (response.ok) {
                    return type;
                }
            } catch {
                // Continue to next type
            }
        }
        
        // Could not determine type
        return null;
    }

    /**
     * Load card data from the content directory
     */
    async loadCard(cardId: string): Promise<CardData> {
        const cardType = await this.determineCardType(cardId);
        const cardPath = `${this.contentBasePath}/cards/${cardType}/${cardId}.json`;
        
        try {
            const response = await fetch(cardPath);
            if (!response.ok) {
                throw new Error(`Failed to load card: ${response.statusText}`);
            }
            const cardData = await response.json() as Record<string, unknown>;
            
            // Type guard to ensure the data matches CardData structure
            if (!this.isCardData(cardData)) {
                throw new Error(`Invalid card data format for ${cardId}`);
            }
            
            return cardData;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Failed to load card ${cardId}: ${message}`);
        }
    }

    /**
     * Determine the type of card from the content directory structure
     */
    async determineCardType(cardId: string): Promise<string> {
        // Known cards mapping for quick lookup
        const knownCardTypes: Record<string, string> = {
            // Skill cards
            'basic_trade': 'skill',
            'basic_heal': 'skill',
            'inspire': 'skill',
            'healing_word': 'skill',
            'dodge': 'skill',
            'quick_escape': 'skill',
            'smoke_bomb': 'skill',
            
            // Power cards
            'protective_ward': 'power',
            'bless': 'power',
            'goblin_rage': 'power',
            
            // Weapon cards
            'cut': 'weapon',
            'stab': 'weapon',
            'parry': 'weapon'
        };

        // First check our known card mappings
        if (knownCardTypes[cardId]) {
            return knownCardTypes[cardId];
        }
        
        // Fall back to checking the card directories
        const cardTypes = ['skill', 'power', 'weapon'];
        
        for (const type of cardTypes) {
            try {
                const response = await fetch(`${this.contentBasePath}/cards/${type}/${cardId}.json`);
                if (response.ok) {
                    return type;
                }
            } catch (error) {
                // Silently continue to next type
            }
        }
        
        throw new Error(`Could not determine type for card: ${cardId}. Make sure the card exists in one of the cards subdirectories.`);
    }

    /**
     * Type guard for EffectData
     */
    private isEffectData(data: Record<string, unknown>): data is Record<string, unknown> & EffectData {
        return (
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.description === 'string' &&
            // Add type property check
            typeof data.type === 'string' &&
            // Effects should have a value or modifier
            (typeof data.value === 'number' || typeof data.modifier === 'number')
        );
    }

    /**
     * Type guard for CardData
     */
    private isCardData(data: Record<string, unknown>): data is Record<string, unknown> & CardData {
        return (
            typeof data.id === 'string' &&
            typeof data.name === 'string' &&
            typeof data.description === 'string'
            // Add additional checks based on your CardData type
        );
    }
} 