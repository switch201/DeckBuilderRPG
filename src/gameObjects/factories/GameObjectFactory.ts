import type { Direction, Exit } from '../Room';
import type { GameObject } from '../GameObject';
import { Room, type RoomType } from '../Room';
import { InteractiveObject } from '../InteractiveObject';
import { CollectibleObject, type CollectibleObjectProps } from '../CollectibleObject';
import { SceneryObject, type SceneryObjectProps } from '../SceneryObject';
import { BasicInteraction } from '../interactions/BasicInteraction';
import { ContentLoader } from '../content/ContentLoader';
import { NPC } from '../NPC';
import { NPCFactory } from './NPCFactory';
import type { NPCData } from './NPCFactory';
import type { GameObjectData } from './BaseGameObjectFactory';
import { BaseGameObjectFactory } from './BaseGameObjectFactory';
import type { Interaction } from '../interactions/Interaction';

/**
 * Type for room JSON data
 */
export type RoomData = GameObjectData & {
    areaId: string;
    exits: ExitData[];
    objects: string[];
    npcs: string[];
    roomType: RoomType;
}

/**
 * Type for exit JSON data
 */
export type ExitData = {
    direction: string;
    targetRoomId: string;
    isLocked: boolean;
    isHidden: boolean;
    requiredKeyId?: string;
    description?: string;
}

/**
 * Type for interaction JSON data
 */
export type InteractionData = {
    name: string;
    description: string;
}

/**
 * Type for object JSON data
 */
export type ObjectData = GameObjectData & {
    type: 'collectible' | 'scenery';
    weight?: number;
    value?: number;
    isObstructing?: boolean;
    interactionIds?: string[];
}

/**
 * Factory for creating rooms
 */
export class RoomFactory extends BaseGameObjectFactory<Room, RoomData> {
    protected validateRoomData(data: RoomData): void {
        if (!data.roomType) throw new Error('Room data must have a roomType');
    }

    async createFromJson(data: RoomData): Promise<Room> {
        this.validateBaseData(data);
        this.validateRoomData(data);
        if (!data.areaId) throw new Error('Room data must have an areaId');
        if (!Array.isArray(data.exits)) throw new Error('Room data must have exits array');
        if (!Array.isArray(data.objects)) throw new Error('Room data must have objects array');

        console.log(`Creating room: ${data.id} with objects:`, data.objects);

        const room = new Room({
            id: data.id,
            name: data.name,
            description: data.description,
            areaId: data.areaId,
            roomType: data.roomType
        });

        for (const exit of data.exits) {
            room.addExit({
                direction: exit.direction as any, // TODO: Validate direction type
                targetRoomId: exit.targetRoomId,
                isLocked: exit.isLocked,
                isHidden: exit.isHidden,
                requiredKeyId: exit.requiredKeyId,
                description: exit.description
            });
        }

        return room;
    }
}

/**
 * Factory for creating game objects
 */
export class ObjectFactory extends BaseGameObjectFactory<GameObject, ObjectData> {
    private contentLoader: ContentLoader;

    constructor(contentLoader: ContentLoader) {
        super();
        this.contentLoader = contentLoader;
    }

    async createFromJson(data: ObjectData): Promise<GameObject> {
        this.validateBaseData(data);
        console.log(`Creating object: ${data.id} of type: ${data.type}`);

        let object: GameObject;

        if (data.type === 'collectible') {
            object = new CollectibleObject({
                id: data.id,
                name: data.name,
                description: data.description,
                weight: data.weight ?? 1,
                value: data.value ?? 0
            });
        } else {
            object = new SceneryObject({
                id: data.id,
                name: data.name,
                description: data.description,
                isObstructing: data.isObstructing ?? false
            });
        }

        // Process interaction references if any are defined
        if (data.interactionIds && Array.isArray(data.interactionIds) && object instanceof InteractiveObject) {
            console.log(`Adding interactions to ${data.id}:`, data.interactionIds);
            const resolvedInteractions = this.contentLoader.resolveInteractions(data.interactionIds);
            for (const interaction of resolvedInteractions) {
                object.addInteraction(interaction);
            }
        }
        
        return object;
    }
}

/**
 * Game content manager that handles loading and caching game objects
 */
export class GameContentManager {
    private static instance: GameContentManager;
    private roomCache: Map<string, Room> = new Map();
    private objectCache: Map<string, GameObject> = new Map();
    private npcCache: Map<string, NPC> = new Map();
    private roomFactory: RoomFactory;
    private objectFactory: ObjectFactory;
    private npcFactory: NPCFactory;
    private contentLoader: ContentLoader;
    private initialized: boolean = false;

    private constructor() {
        this.roomFactory = new RoomFactory();
        this.contentLoader = new ContentLoader();
        this.objectFactory = new ObjectFactory(this.contentLoader);
        this.npcFactory = new NPCFactory(this.contentLoader);
    }

    static async getInstance(): Promise<GameContentManager> {
        if (!GameContentManager.instance) {
            GameContentManager.instance = new GameContentManager();
            await GameContentManager.instance.initialize();
        }
        return GameContentManager.instance;
    }

    private async initialize(): Promise<void> {
        if (!this.initialized) {
            // Wait for the ContentLoader to finish loading interactions
            await new Promise<void>((resolve) => {
                const checkLoaded = () => {
                    if (this.contentLoader.isLoaded()) {
                        resolve();
                    } else {
                        setTimeout(checkLoaded, 100);
                    }
                };
                checkLoaded();
            });
            this.initialized = true;
        }
    }

    async loadRoom(roomId: string): Promise<Room> {
        console.log(`Loading room: ${roomId}`);
        
        // Check cache first
        const cachedRoom = this.roomCache.get(roomId);
        if (cachedRoom) {
            console.log(`Found cached room: ${roomId}`);
            return cachedRoom;
        }

        try {
            // Load room content - fix path to remove leading slash
            console.log(`Fetching room data from: src/content/rooms/${roomId}.json`);
            const response = await fetch(`src/content/rooms/${roomId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load room: ${roomId} (${response.status} ${response.statusText})`);
            }

            const data = await response.json() as RoomData;
            if (!this.isValidRoomData(data)) {
                throw new Error(`Invalid room data format for room: ${roomId}`);
            }

            const room = await this.roomFactory.createFromJson(data);
            console.log(`Created room instance: ${room.id}`);

            // Load and add objects
            console.log(`Loading ${data.objects.length} objects for room ${roomId}`);
            for (const objectId of data.objects) {
                try {
                    console.log(`Loading object: ${objectId}`);
                    const object = await this.loadObject(objectId);
                    if (object) {
                        console.log(`Successfully loaded object: ${objectId}, adding to room`);
                        room.addObject(object);
                    }
                } catch (error) {
                    console.error(`Failed to load object ${objectId} for room ${roomId}:`, error);
                }
            }

            // Load and add NPCs
            console.log(`Loading ${data.npcs?.length || 0} NPCs for room ${roomId}`);
            for (const npcId of data.npcs || []) {
                try {
                    console.log(`Loading NPC: ${npcId}`);
                    const npc = await this.loadNPC(npcId);
                    if (npc) {
                        console.log(`Successfully loaded NPC: ${npcId}, adding to room`);
                        room.addObject(npc);
                    }
                } catch (error) {
                    console.error(`Failed to load NPC ${npcId} for room ${roomId}:`, error);
                }
            }

            console.log(`Room ${roomId} now contains:`, {
                objects: room.containedObjects.map(obj => obj.id),
                npcs: room.npcs.map(npc => npc.id)
            });

            // Cache and return
            this.roomCache.set(roomId, room);
            return room;

        } catch (error) {
            console.error(`Error loading room ${roomId}:`, error);
            throw error;
        }
    }

    async loadNPC(npcId: string): Promise<NPC | undefined> {
        console.log(`Loading NPC: ${npcId}`);
        
        // Check cache first
        const cachedNPC = this.npcCache.get(npcId);
        if (cachedNPC) {
            console.log(`Found cached NPC: ${npcId}`);
            return cachedNPC;
        }

        try {
            // Try to load from each NPC type directory
            const npcTypes = ['merchants', 'enemies', 'quest_givers'];
            let npcData: NPCData | null = null;

            for (const type of npcTypes) {
                try {
                    const response = await fetch(`src/content/npcs/${type}/${npcId}.json`);
                    if (response.ok) {
                        npcData = await response.json();
                        break;
                    }
                } catch (e) {
                    console.warn(`Could not load NPC ${npcId} from ${type} directory:`, e);
                    // Continue trying other directories
                }
            }

            if (!npcData) {
                throw new Error(`Could not find NPC data for: ${npcId}`);
            }

            console.log(`Successfully loaded NPC data:`, npcData);
            const npc = await this.npcFactory.createFromJson(npcData);
            this.npcCache.set(npcId, npc);
            return npc;

        } catch (error) {
            console.error(`Error loading NPC ${npcId}:`, error);
            throw error;
        }
    }

    async loadObject(objectId: string): Promise<GameObject | undefined> {
        console.log(`Loading object: ${objectId}`);
        
        // Check cache first
        const cachedObject = this.objectCache.get(objectId);
        if (cachedObject) {
            console.log(`Found cached object: ${objectId}`);
            return cachedObject;
        }

        try {
            // Only look in the scenery directory since that's where our objects are
            const response = await fetch(`src/content/scenery/${objectId}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load object: ${objectId} (${response.status} ${response.statusText})`);
            }

            const data = await response.json();
            if (!this.isValidObjectData(data)) {
                throw new Error(`Invalid object data format for: ${objectId}`);
            }

            console.log(`Successfully loaded object data:`, data);
            const object = await this.objectFactory.createFromJson(data);
            this.objectCache.set(objectId, object);
            return object;

        } catch (error) {
            console.error(`Error loading object ${objectId}:`, error);
            throw error; // Re-throw the error instead of returning undefined
        }
    }

    private isValidRoomData(data: unknown): data is RoomData {
        const roomData = data as RoomData;
        return (
            typeof roomData === 'object' &&
            roomData !== null &&
            typeof roomData.id === 'string' &&
            typeof roomData.name === 'string' &&
            typeof roomData.description === 'string' &&
            typeof roomData.type === 'string' &&
            typeof roomData.areaId === 'string' &&
            Array.isArray(roomData.exits) &&
            Array.isArray(roomData.objects) &&
            (roomData.npcs === undefined || Array.isArray(roomData.npcs))
        );
    }

    private isValidObjectData(data: unknown): data is ObjectData {
        const objectData = data as ObjectData;
        return (
            typeof objectData === 'object' &&
            objectData !== null &&
            typeof objectData.id === 'string' &&
            typeof objectData.name === 'string' &&
            typeof objectData.description === 'string' &&
            typeof objectData.type === 'string' &&
            (objectData.type === 'collectible' || objectData.type === 'scenery')
        );
    }
} 