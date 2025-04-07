import { Room } from '../gameObjects/Room';
import { GameObject } from '../gameObjects/GameObject';
import type { Direction } from '../gameObjects/Room';

/**
 * Represents the current mode of the game
 */
export type GameMode = 'overworld' | 'combat';

/**
 * Represents a game save state that can be serialized/deserialized
 */
export interface GameSaveState {
    currentRoomId: string;
    visitedRoomIds: string[];
    discoveredRoomIds: string[];
    exploredRoomIds: string[];
    playerInventoryIds: string[];
    playerHealth: number;
    playerLevel: number;
    playerExperience: number;
    gameMode: GameMode;
    gameTime: number;
}

/**
 * Abstract base class for managing game state.
 * This class is responsible for maintaining and persisting game state,
 * but does not implement game rules (which should be in the Rules Engine).
 */
export abstract class Game {
    // Efficient room lookup using Map
    private readonly _rooms: Map<string, Room>;
    // Area-based room organization for quick area-specific operations
    private readonly _areaRooms: Map<string, Set<string>>;
    // Game object lookup (includes items, NPCs, etc.)
    private readonly _gameObjects: Map<string, GameObject>;
    
    private _currentRoomId: string;
    private _gameMode: GameMode;
    private _gameTime: number;

    constructor() {
        this._rooms = new Map();
        this._areaRooms = new Map();
        this._gameObjects = new Map();
        this._gameMode = 'overworld';
        this._gameTime = 0;
        this._currentRoomId = '';
    }

    /**
     * The current room the player is in
     */
    get currentRoom(): Room | undefined {
        return this._rooms.get(this._currentRoomId);
    }

    /**
     * The current game mode
     */
    get gameMode(): GameMode {
        return this._gameMode;
    }

    /**
     * The current game time (in game ticks)
     */
    get gameTime(): number {
        return this._gameTime;
    }

    /**
     * Add a room to the game
     */
    protected addRoom(room: Room): void {
        this._rooms.set(room.id, room);
        
        // Add to area organization
        let areaRooms = this._areaRooms.get(room.areaId);
        if (!areaRooms) {
            areaRooms = new Set();
            this._areaRooms.set(room.areaId, areaRooms);
        }
        areaRooms.add(room.id);
    }

    /**
     * Get a room by its ID
     */
    getRoom(roomId: string): Room | undefined {
        return this._rooms.get(roomId);
    }

    /**
     * Get all rooms in a specific area
     */
    getRoomsByArea(areaId: string): Room[] {
        const roomIds = this._areaRooms.get(areaId);
        if (!roomIds) return [];
        return Array.from(roomIds).map(id => this._rooms.get(id)!);
    }

    /**
     * Add a game object to the game
     */
    protected addGameObject(obj: GameObject): void {
        this._gameObjects.set(obj.id, obj);
    }

    /**
     * Get a game object by its ID
     */
    getGameObject(objId: string): GameObject | undefined {
        return this._gameObjects.get(objId);
    }

    /**
     * Move the player to a new room
     */
    protected moveToRoom(roomId: string): boolean {
        const targetRoom = this._rooms.get(roomId);
        if (!targetRoom) return false;

        const currentRoom = this.currentRoom;
        if (currentRoom) {
            // Check if rooms are connected
            const direction = this.getDirectionBetweenRooms(currentRoom, targetRoom);
            if (!direction) return false;
            
            const exit = currentRoom.allExits.find(e => e.direction === direction);
            if (!exit || exit.isLocked) return false;
        }

        this._currentRoomId = roomId;
        targetRoom.markAsVisited();
        return true;
    }

    /**
     * Get the direction between two rooms if they're connected
     */
    private getDirectionBetweenRooms(from: Room, to: Room): Direction | undefined {
        const exit = from.allExits.find(e => e.targetRoomId === to.id);
        return exit?.direction;
    }

    /**
     * Switch the game mode
     */
    protected setGameMode(mode: GameMode): void {
        this._gameMode = mode;
    }

    /**
     * Advance the game time
     */
    protected advanceTime(ticks: number = 1): void {
        this._gameTime += ticks;
    }

    /**
     * Get the current game state for saving
     */
    abstract getSaveState(): GameSaveState;

    /**
     * Load a game state
     */
    abstract loadSaveState(state: GameSaveState): void;

    /**
     * Initialize a new game
     */
    abstract initializeNewGame(): void;
} 