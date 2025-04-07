import { InteractiveObject, type InteractiveObjectProps } from './InteractiveObject';

export type CollectibleObjectProps = InteractiveObjectProps & {
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