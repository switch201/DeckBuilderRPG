import { InteractiveObject } from './InteractiveObject';

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