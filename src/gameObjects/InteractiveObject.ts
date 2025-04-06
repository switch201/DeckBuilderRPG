import { GameObject } from './GameObject';
import type { Interaction } from './interactions/Interaction';

/**
 * Base class for objects that can have custom interactions
 */
export class InteractiveObject extends GameObject {
    private readonly _interactions: Map<string, Interaction>;

    constructor(id: string, name: string, description: string) {
        super(id, name, description);
        this._interactions = new Map();
    }

    /**
     * Get all available interactions for this object
     */
    get availableInteractions(): readonly Interaction[] {
        return Array.from(this._interactions.values());
    }

    /**
     * Add a new interaction to this object - protected method for internal use
     */
    protected internalAddInteraction(interaction: Interaction): void {
        this._interactions.set(interaction.name, interaction);
    }

    /**
     * Public method to add an interaction to this object
     */
    public addInteraction(interaction: Interaction): void {
        this.internalAddInteraction(interaction);
    }

    /**
     * Remove an interaction from this object
     */
    protected removeInteraction(name: string): void {
        this._interactions.delete(name);
    }

    /**
     * Execute a specific interaction by name
     */
    executeInteraction(name: string): boolean {
        const interaction = this._interactions.get(name);
        if (!interaction) return false;
        interaction.execute();
        return true;
    }
}

/**
 * Base class for objects that can be collected by the player
 */
export abstract class CollectibleObject extends InteractiveObject {
    private _isCollected: boolean;
    private readonly _weight: number;
    private readonly _value: number;

    constructor(
        id: string,
        name: string,
        description: string,
        weight: number,
        value: number
    ) {
        super(id, name, description);
        this._isCollected = false;
        this._weight = weight;
        this._value = value;
    }

    get isCollected(): boolean {
        return this._isCollected;
    }

    get weight(): number {
        return this._weight;
    }

    get value(): number {
        return this._value;
    }

    /**
     * Mark the object as collected
     */
    collect(): void {
        this._isCollected = true;
    }

    /**
     * Return the object to the world
     */
    drop(): void {
        this._isCollected = false;
    }
}

/**
 * Base class for objects that can be equipped by the player
 */
export abstract class EquippableObject extends CollectibleObject {
    private _isEquipped: boolean;
    private readonly _equipSlot: string;

    constructor(
        id: string,
        name: string,
        description: string,
        weight: number,
        value: number,
        equipSlot: string
    ) {
        super(id, name, description, weight, value);
        this._isEquipped = false;
        this._equipSlot = equipSlot;
    }

    get isEquipped(): boolean {
        return this._isEquipped;
    }

    get equipSlot(): string {
        return this._equipSlot;
    }

    /**
     * Equip the object
     */
    equip(): void {
        this._isEquipped = true;
    }

    /**
     * Unequip the object
     */
    unequip(): void {
        this._isEquipped = false;
    }

    /**
     * Get the stats/effects this object provides when equipped
     */
    abstract getEquipEffects(): Record<string, number>;
}

/**
 * Base class for static scenery objects that can't be collected
 */
export abstract class SceneryObject extends InteractiveObject {
    private readonly _isObstructing: boolean;

    constructor(
        id: string,
        name: string,
        description: string,
        isObstructing: boolean = false
    ) {
        super(id, name, description);
        this._isObstructing = isObstructing;
    }

    /**
     * Whether this object blocks movement or line of sight
     */
    get isObstructing(): boolean {
        return this._isObstructing;
    }
} 