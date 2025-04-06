import React, { useEffect, useState } from 'react';
import { GameState } from '../gameState/GameState';
import { Room } from '../gameObjects/Room';
import type { RoomVisibility } from '../gameObjects/Room';
import '../styles/MiniMap.css';

interface MiniMapProps {
    gameState: GameState;
    onRoomClick?: (roomId: string) => void;
}

interface MapNode {
    roomId: string;
    name: string;
    visibility: RoomVisibility;
    x: number;
    y: number;
    connections: {
        north?: string;
        south?: string;
        east?: string;
        west?: string;
    };
}

export const MiniMap: React.FC<MiniMapProps> = ({ gameState, onRoomClick }) => {
    const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
    const [dimensions, setDimensions] = useState({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    
    useEffect(() => {
        // Build map data from game state
        buildMapData();
    }, [gameState.visitedRooms, gameState.currentRoom.id]);

    const buildMapData = () => {
        const nodes: MapNode[] = [];
        const visited = new Set<string>();
        
        // Start with current room at (0,0)
        const queue: Array<{room: Room, x: number, y: number}> = [
            { room: gameState.currentRoom, x: 0, y: 0 }
        ];
        
        while (queue.length > 0) {
            const { room, x, y } = queue.shift()!;
            
            if (visited.has(room.id)) {
                continue;
            }
            
            visited.add(room.id);
            
            const connections: MapNode['connections'] = {};
            
            // Process all exits from this room
            for (const exit of room.allExits) {
                let nextX = x;
                let nextY = y;
                
                // Calculate position of connected room
                switch (exit.direction) {
                    case 'north':
                        nextY -= 1;
                        connections.north = exit.targetRoomId;
                        break;
                    case 'south':
                        nextY += 1;
                        connections.south = exit.targetRoomId;
                        break;
                    case 'east':
                        nextX += 1;
                        connections.east = exit.targetRoomId;
                        break;
                    case 'west':
                        nextX -= 1;
                        connections.west = exit.targetRoomId;
                        break;
                    // Ignore up/down for 2D minimap
                }
                
                // Only process rooms the player knows about (discovered or visited)
                const nextRoom = gameState.getRoomById(exit.targetRoomId);
                if (nextRoom && (nextRoom.visibility === 'discovered' || nextRoom.visibility === 'visited')) {
                    queue.push({ room: nextRoom, x: nextX, y: nextY });
                }
            }
            
            // Add this room to our map nodes
            nodes.push({
                roomId: room.id,
                name: room.name,
                visibility: room.visibility,
                x,
                y,
                connections
            });
        }
        
        // Calculate map boundaries
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y));
        
        setMapNodes(nodes);
        setDimensions({ minX, maxX, minY, maxY });
    };
    
    // If no rooms to display, return nothing
    if (mapNodes.length === 0) {
        return null;
    }
    
    const gridSize = 40; // Size of each room cell in pixels
    const borderWidth = 2; // Width of the borders between rooms
    
    // Calculate canvas size
    const width = (dimensions.maxX - dimensions.minX + 1) * gridSize;
    const height = (dimensions.maxY - dimensions.minY + 1) * gridSize;
    
    return (
        <div className="mini-map-container">
            <h3>Map</h3>
            <div 
                className="mini-map"
                style={{ 
                    width: `${width}px`, 
                    height: `${height}px`,
                    position: 'relative',
                    border: '1px solid #333',
                    backgroundColor: '#111'
                }}
            >
                {/* Render room connections (paths) */}
                {mapNodes.map(node => {
                    const nodeX = (node.x - dimensions.minX) * gridSize;
                    const nodeY = (node.y - dimensions.minY) * gridSize;
                    
                    return Object.entries(node.connections).map(([direction, targetId]) => {
                        if (!targetId) return null;
                        
                        // Calculate connection style based on direction
                        let connectionStyle = {};
                        switch (direction) {
                            case 'north':
                                connectionStyle = {
                                    left: `${nodeX + gridSize / 2 - borderWidth / 2}px`,
                                    top: `${nodeY}px`,
                                    width: `${borderWidth}px`,
                                    height: `${gridSize / 2}px`,
                                    transform: 'translateY(-100%)'
                                };
                                break;
                            case 'south':
                                connectionStyle = {
                                    left: `${nodeX + gridSize / 2 - borderWidth / 2}px`,
                                    top: `${nodeY + gridSize}px`,
                                    width: `${borderWidth}px`,
                                    height: `${gridSize / 2}px`,
                                };
                                break;
                            case 'east':
                                connectionStyle = {
                                    left: `${nodeX + gridSize}px`,
                                    top: `${nodeY + gridSize / 2 - borderWidth / 2}px`,
                                    width: `${gridSize / 2}px`,
                                    height: `${borderWidth}px`,
                                };
                                break;
                            case 'west':
                                connectionStyle = {
                                    left: `${nodeX}px`,
                                    top: `${nodeY + gridSize / 2 - borderWidth / 2}px`,
                                    width: `${gridSize / 2}px`,
                                    height: `${borderWidth}px`,
                                    transform: 'translateX(-100%)'
                                };
                                break;
                        }
                        
                        return (
                            <div 
                                key={`${node.roomId}-${direction}`}
                                className="room-connection"
                                style={{
                                    position: 'absolute',
                                    backgroundColor: '#aaa',
                                    ...connectionStyle
                                }}
                            />
                        );
                    });
                })}
                
                {/* Render room nodes */}
                {mapNodes.map(node => {
                    const nodeX = (node.x - dimensions.minX) * gridSize;
                    const nodeY = (node.y - dimensions.minY) * gridSize;
                    
                    // Determine room style based on visibility
                    let bgColor = '#333'; // Undiscovered
                    let border = '1px solid #555';
                    
                    if (node.visibility === 'visited') {
                        bgColor = '#2a4d69'; // Visited
                        border = '1px solid #4b86b4';
                    } else if (node.visibility === 'discovered') {
                        bgColor = '#2a3d50'; // Discovered
                        border = '1px solid #3d5a80';
                    }
                    
                    // Highlight current room
                    const isCurrentRoom = node.roomId === gameState.currentRoom.id;
                    if (isCurrentRoom) {
                        bgColor = '#4b86b4';
                        border = '2px solid #adcbe3';
                    }
                    
                    return (
                        <div
                            key={node.roomId}
                            className={`map-node ${isCurrentRoom ? 'current' : ''}`}
                            title={node.name}
                            onClick={() => onRoomClick && onRoomClick(node.roomId)}
                            style={{
                                position: 'absolute',
                                left: `${nodeX}px`,
                                top: `${nodeY}px`,
                                width: `${gridSize - 2}px`,
                                height: `${gridSize - 2}px`,
                                backgroundColor: bgColor,
                                border,
                                cursor: onRoomClick ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#fff',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '2px'
                            }}
                        >
                            {node.name}
                        </div>
                    );
                })}
            </div>
            
            {/* Add a legend */}
            <div className="mini-map-legend">
                <div className="legend-item">
                    <div className="legend-color visited"></div>
                    <span>Visited</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color discovered"></div>
                    <span>Discovered</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color current"></div>
                    <span>Current</span>
                </div>
            </div>
        </div>
    );
}; 