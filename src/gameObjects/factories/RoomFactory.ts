import { Room, type RoomType } from "../Room";
import { BaseGameObjectFactory, type GameObjectData } from "./BaseGameObjectFactory";

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
 * Factory for creating rooms
 */
export class RoomFactory extends BaseGameObjectFactory<Room, RoomData> {


    isValidData(data: GameObjectData): data is RoomData {
        return (
            'areaId' in data &&
            'exits' in data &&
            'objects' in data &&
            'npcs' in data &&
            'roomType' in data
        );
    }

    async createFromJson(data: unknown): Promise<Room> {
        if(!this.isValidGameObjectData(data) || !this.isValidData(data)) {
            throw new Error('Invalid room data');
        }

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