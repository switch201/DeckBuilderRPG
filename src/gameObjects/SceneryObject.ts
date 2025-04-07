import { InteractiveObject, type InteractiveObjectProps } from './InteractiveObject';

export type SceneryObjectProps = InteractiveObjectProps & {
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

    /**
     * Whether this object blocks movement or line of sight
     */
    get isObstructing(): boolean {
        return this._isObstructing;
    }
} 