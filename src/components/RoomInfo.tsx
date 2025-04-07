import React from 'react';
import type { Room } from '../gameObjects/Room';

type RoomInfoProps = {
    room: Room;
}

export const RoomInfo: React.FC<RoomInfoProps> = ({ room }) => {
    return (
        <div className="room-info">
            <h2>{room.name}</h2>
            <p>{room.description}</p>
        </div>
    );
}; 