/**
 * Base class for all game objects in the game.
 * Every game object must have a unique ID, name, and description.
 */
export abstract class GameObject {
    private readonly _id: string;
    private _name: string;
    private _description: string;

    constructor(id: string, name: string, description: string) {
        this._id = id;
        this._name = name;
        this._description = description;
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
     * Returns a string representation of the game object
     */
    toString(): string {
        return `${this.name} (${this.id})`;
    }
} 