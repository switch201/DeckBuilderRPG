import { GameObject, type GameObjectProps, type GameObjectType } from './GameObject';
import type { Interaction } from './interactions/Interaction';

export interface InteractiveObjectProps extends GameObjectProps {}

/**
 * Base class for objects that can have custom interactions
 */
export class InteractiveObject extends GameObject {
    private readonly _interactions: Map<string, Interaction>;

    constructor(props: InteractiveObjectProps) {
        super(props);
        this._interactions = new Map();
    }

    get type(): GameObjectType {
        return 'interactive';
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

export interface CollectibleObjectProps extends InteractiveObjectProps {
    weight: number;
    value: number;
}

/**
 * Base class for objects that can be collected by the player
 */
export class CollectibleObject extends InteractiveObject {
    private _isCollected: boolean;
    private readonly _weight: number;
    private readonly _value: number;

    constructor(props: CollectibleObjectProps) {
        super(props);
        this._isCollected = false;
        this._weight = props.weight;
        this._value = props.value;
    }

    get type(): GameObjectType {
        return 'collectible';
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

export interface EquippableObjectProps extends CollectibleObjectProps {
    equipSlot: string;
}

/**
 * Base class for objects that can be equipped by the player
 */
export abstract class EquippableObject extends CollectibleObject {
    private _isEquipped: boolean;
    private readonly _equipSlot: string;

    constructor(props: EquippableObjectProps) {
        super(props);
        this._isEquipped = false;
        this._equipSlot = props.equipSlot;
    }

    get type(): GameObjectType {
        return 'equippable';
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

export interface SceneryObjectProps extends InteractiveObjectProps {
    isObstructing?: boolean;
}

/**
 * Base class for static scenery objects that can't be collected
 */
export class SceneryObject extends InteractiveObject {
    private readonly _isObstructing: boolean;

    constructor(props: SceneryObjectProps) {
        super(props);
        this._isObstructing = props.isObstructing ?? false;
    }

    get type(): GameObjectType {
        return 'scenery';
    }

    /**
     * Whether this object blocks movement or line of sight
     */
    get isObstructing(): boolean {
        return this._isObstructing;
    }
} 