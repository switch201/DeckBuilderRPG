export type GameObjectType = 'room' | 'scenery' | 'collectible' | 'interactive' | 'npc' | 'card' | 'effect' | 'equippable';

/**
 * Properties for creating a GameObject
 */
export type GameObjectProps = {
    id: string;
    name: string;
    description: string;
}

/**
 * Base class for all game objects in the game.
 * Every game object must have a unique ID, name, and description.
 */
export abstract class GameObject {
    private readonly _id: string;
    private _name: string;
    private _description: string;

    constructor(props: GameObjectProps) {
        this._id = props.id;
        this._name = props.name;
        this._description = props.description;
    }

    /**
     * Unique identifier for the game object
     */
    get id(): string {
        return this._id;
    }

    /**
     * Name of the game object
     */
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    /**
     * Description of the game object
     */
    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    /**
     * Type of the game object
     */
    abstract get type(): GameObjectType;

    /**
     * Returns a string representation of the game object
     */
    toString(): string {
        return `${this.name} (${this.id})`;
    }
} 