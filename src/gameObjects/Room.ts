import { GameObject } from './GameObject';
import { NPC } from './NPC';

/**
 * Represents a direction that can be used to exit a room
 */
export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down';

/**
 * Maps directions to their opposite direction
 */
export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
    north: 'south',
    south: 'north',
    east: 'west',
    west: 'east',
    up: 'down',
    down: 'up'
};

/**
 * Represents the state of visibility for a room
 */
export type RoomVisibility = 'undiscovered' | 'discovered' | 'visited';

/**
 * Represents an exit from one room to another
 */
export interface Exit {
    direction: Direction;
    targetRoomId: string;
    isLocked: boolean;
    isHidden: boolean;
    requiredKeyId: string | undefined;
    description: string | undefined;
}

/**
 * Abstract base class for all rooms in the game.
 * Rooms can contain other game objects and have exits to other rooms.
 */
export abstract class Room extends GameObject {
    private _exits: Exit[];
    private _containedObjects: GameObject[];
    private _npcs: NPC[];
    private _visibility: RoomVisibility;
    private _isExplored: boolean;
    private _areaId: string;

    constructor(
        id: string,
        name: string,
        description: string,
        areaId: string,
        exits: Exit[] = [],
        containedObjects: GameObject[] = [],
        npcs: NPC[] = []
    ) {
        super(id, name, description);
        this._exits = exits;
        this._containedObjects = containedObjects.filter(obj => !(obj instanceof NPC));
        this._npcs = npcs;
        this._visibility = 'undiscovered';
        this._isExplored = false;
        this._areaId = areaId;
    }

    /**
     * The area this room belongs to
     */
    get areaId(): string {
        return this._areaId;
    }

    /**
     * All available exits from this room that are visible
     */
    get visibleExits(): readonly Exit[] {
        return this._exits.filter(exit => !exit.isHidden);
    }

    /**
     * All exits from this room, including hidden ones
     */
    get allExits(): readonly Exit[] {
        return this._exits;
    }

    /**
     * All game objects currently in this room (excluding NPCs)
     */
    get containedObjects(): readonly GameObject[] {
        return this._containedObjects;
    }

    /**
     * All NPCs currently in this room
     */
    get npcs(): readonly NPC[] {
        return this._npcs;
    }

    /**
     * The current visibility state of the room
     */
    get visibility(): RoomVisibility {
        return this._visibility;
    }

    /**
     * Whether the room has been fully explored
     */
    get isExplored(): boolean {
        return this._isExplored;
    }

    /**
     * Mark the room as discovered (player knows about it but hasn't visited)
     */
    markAsDiscovered(): void {
        if (this._visibility === 'undiscovered') {
            this._visibility = 'discovered';
        }
    }

    /**
     * Mark the room as visited (player has been here)
     */
    markAsVisited(): void {
        this._visibility = 'visited';
    }

    /**
     * Mark the room as explored (player has found all secrets/items)
     */
    markAsExplored(): void {
        this._isExplored = true;
    }

    /**
     * Add an exit to the room
     */
    addExit(exit: Exit): void {
        if (!this.hasExit(exit.direction)) {
            this._exits.push(exit);
        }
    }

    /**
     * Create a bidirectional connection between two rooms
     */
    static connectRooms(
        room1: Room,
        room2: Room,
        direction: Direction,
        isLocked: boolean = false,
        isHidden: boolean = false,
        requiredKeyId?: string,
        description?: string
    ): void {
        const oppositeDirection = OPPOSITE_DIRECTIONS[direction];
        
        room1.addExit({
            direction,
            targetRoomId: room2.id,
            isLocked,
            isHidden,
            requiredKeyId,
            description
        });

        room2.addExit({
            direction: oppositeDirection,
            targetRoomId: room1.id,
            isLocked,
            isHidden,
            requiredKeyId,
            description
        });
    }

    /**
     * Remove an exit from the room
     */
    removeExit(direction: Direction): void {
        this._exits = this._exits.filter(exit => exit.direction !== direction);
    }

    /**
     * Add a game object to the room
     */
    addObject(obj: GameObject): void {
        if (obj instanceof NPC) {
            this._npcs.push(obj);
        } else {
            this._containedObjects.push(obj);
        }
    }

    /**
     * Remove a game object from the room
     */
    removeObject(objId: string): GameObject | undefined {
        // Try to remove from regular objects first
        const objIndex = this._containedObjects.findIndex(obj => obj.id === objId);
        if (objIndex !== -1) {
            return this._containedObjects.splice(objIndex, 1)[0];
        }

        // If not found, try to remove from NPCs
        const npcIndex = this._npcs.findIndex(npc => npc.id === objId);
        if (npcIndex !== -1) {
            return this._npcs.splice(npcIndex, 1)[0];
        }

        return undefined;
    }

    /**
     * Find a game object in the room by its ID
     */
    findObject(objId: string): GameObject | undefined {
        // Check regular objects first
        const obj = this._containedObjects.find(obj => obj.id === objId);
        if (obj) return obj;

        // Then check NPCs
        return this._npcs.find(npc => npc.id === objId);
    }

    /**
     * Find an NPC in the room by its ID
     */
    findNPC(npcId: string): NPC | undefined {
        return this._npcs.find(npc => npc.id === npcId);
    }

    /**
     * Check if the room has an exit in the given direction
     */
    private hasExit(direction: Direction): boolean {
        return this._exits.some(exit => exit.direction === direction);
    }

    /**
     * Abstract method that must be implemented by concrete rooms
     * to determine if a specific game object can be added to this room
     */
    abstract canContainObject(obj: GameObject): boolean;
} 