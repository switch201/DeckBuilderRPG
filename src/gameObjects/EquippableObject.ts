import { CollectibleObject, type CollectibleObjectProps } from './CollectibleObject';

export type EquippableObjectProps = CollectibleObjectProps & {
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