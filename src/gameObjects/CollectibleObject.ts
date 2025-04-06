import { InteractiveObject } from './InteractiveObject';

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