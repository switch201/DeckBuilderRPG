import { Room } from '../gameObjects/Room';
import { GameObject } from '../gameObjects/GameObject';
import { CollectibleObject } from '../gameObjects/InteractiveObject';
import { GameContentManager } from '../gameObjects/factories/GameObjectFactory';

export class GameState {
    private _currentRoom: Room;
    private _inventory: CollectibleObject[];
    private _visitedRooms: Set<string>;
    private _contentManager: GameContentManager;
    private _roomCache: Map<string, Room>; // Cache to store loaded rooms

    private constructor(startingRoom: Room, contentManager: GameContentManager) {
        this._currentRoom = startingRoom;
        this._inventory = [];
        this._visitedRooms = new Set();
        this._contentManager = contentManager;
        this._roomCache = new Map();
        this._roomCache.set(startingRoom.id, startingRoom);
        this.visitRoom(startingRoom);
    }

    static async create(startingRoom: Room): Promise<GameState> {
        const contentManager = await GameContentManager.getInstance();
        return new GameState(startingRoom, contentManager);
    }

    get currentRoom(): Room {
        return this._currentRoom;
    }

    get inventory(): readonly CollectibleObject[] {
        return this._inventory;
    }

    get visitedRooms(): readonly string[] {
        return Array.from(this._visitedRooms);
    }

    private visitRoom(room: Room): void {
        room.markAsVisited();
        this._visitedRooms.add(room.id);
        this._roomCache.set(room.id, room);
    }

    /**
     * Get a room by its ID from the cache
     * Only returns rooms that have been previously visited or discovered
     */
    getRoomById(roomId: string): Room | undefined {
        return this._roomCache.get(roomId);
    }

    /**
     * Load a room by its ID
     * First checks the cache, then attempts to load from content manager
     */
    async loadRoomById(roomId: string): Promise<Room | undefined> {
        // Return from cache if available
        if (this._roomCache.has(roomId)) {
            return this._roomCache.get(roomId);
        }
        
        // Try to load the room
        try {
            const room = await this._contentManager.loadRoom(roomId);
            this._roomCache.set(roomId, room);
            return room;
        } catch (error) {
            console.error(`Failed to load room ${roomId}:`, error);
            return undefined;
        }
    }

    async moveToRoom(targetRoomId: string): Promise<boolean> {
        const exit = this._currentRoom.allExits.find(e => e.targetRoomId === targetRoomId);
        if (!exit || exit.isLocked) {
            return false;
        }
        
        try {
            const newRoom = await this._contentManager.loadRoom(targetRoomId);
            this._currentRoom = newRoom;
            this.visitRoom(newRoom);
            return true;
        } catch (error) {
            console.error(`Failed to load room ${targetRoomId}:`, error);
            return false;
        }
    }

    inspectObject(objectId: string): GameObject | undefined {
        // Check room objects first
        const roomObject = this._currentRoom.findObject(objectId);
        if (roomObject) {
            return roomObject;
        }

        // Then check inventory
        return this._inventory.find(item => item.id === objectId);
    }

    takeObject(objectId: string): boolean {
        const object = this._currentRoom.findObject(objectId);
        if (!object || !(object instanceof CollectibleObject)) {
            return false;
        }

        const removedObject = this._currentRoom.removeObject(objectId);
        if (removedObject instanceof CollectibleObject) {
            removedObject.collect();
            this._inventory.push(removedObject);
            return true;
        }

        return false;
    }
} 