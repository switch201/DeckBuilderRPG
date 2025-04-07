import React, { useEffect, useState, useRef } from 'react';
import { GameState } from '../gameState/GameState';
import { Room } from '../gameObjects/Room';
import type { RoomVisibility } from '../gameObjects/Room';
import '../styles/MiniMap.css';

type MiniMapProps = {
    gameState: GameState;
    onRoomClick?: (roomId: string) => void;
}

type MapNode = {
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

type TooltipState = {
    visible: boolean;
    x: number;
    y: number;
    text: string;
}

type RoomPosition = {
    x: number;
    y: number;
}

export const MiniMap: React.FC<MiniMapProps> = ({ gameState, onRoomClick }) => {
    const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
    const [dimensions, setDimensions] = useState({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
    const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, text: '' });
    const mapRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Build map data from game state
        buildMapData();
    }, [gameState]);

    const buildMapData = () => {
        const nodes: MapNode[] = [];
        const visited = new Set<string>();
        // Map to store the final calculated position of each room
        const positionMap = new Map<string, RoomPosition>();
        
        // Start with current room at (0,0)
        const queue: Array<{room: Room, x: number, y: number}> = [
            { room: gameState.currentRoom, x: 0, y: 0 }
        ];
        
        // Set the initial position for the current room
        positionMap.set(gameState.currentRoom.id, { x: 0, y: 0 });
        
        while (queue.length > 0) {
            const { room, x, y } = queue.shift()!;
            
            if (visited.has(room.id)) {
                continue;
            }
            
            visited.add(room.id);
            
            // Ensure we use the latest position for this room from our map
            const currentPos = positionMap.get(room.id) || { x, y };
            const connections: MapNode['connections'] = {};
            
            // Process all exits from this room
            for (const exit of room.allExits) {
                // Calculate position of connected room
                let nextX = currentPos.x;
                let nextY = currentPos.y;
                
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
                    // Check if this room already has a position
                    if (!positionMap.has(nextRoom.id)) {
                        positionMap.set(nextRoom.id, { x: nextX, y: nextY });
                    }
                    
                    queue.push({ 
                        room: nextRoom,
                        // Always use the position from our map to avoid inconsistencies
                        x: positionMap.get(nextRoom.id)!.x,
                        y: positionMap.get(nextRoom.id)!.y
                    });
                }
            }
            
            // Add this room to our map nodes using the position from our map
            nodes.push({
                roomId: room.id,
                name: room.name,
                visibility: room.visibility,
                x: currentPos.x,
                y: currentPos.y,
                connections
            });
        }
        
        // Check if we have any nodes
        if (nodes.length === 0) {
            setMapNodes([]);
            setDimensions({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
            return;
        }
        
        // Calculate map boundaries
        const minX = Math.min(...nodes.map(n => n.x));
        const maxX = Math.max(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y));
        
        setMapNodes(nodes);
        setDimensions({ minX, maxX, minY, maxY });
    };

    const showTooltip = (e: React.MouseEvent, name: string) => {
        if (!mapRef.current) return;
        
        const rect = mapRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setTooltip({
            visible: true,
            x,
            y,
            text: name
        });
    };
    
    const hideTooltip = () => {
        setTooltip({ ...tooltip, visible: false });
    };
    
    // If no rooms to display, return nothing
    if (mapNodes.length === 0) {
        return null;
    }
    
    const gridSize = 50; // Size of each room cell in pixels
    const borderWidth = 3; // Width of the borders between rooms
    
    // Calculate canvas size with padding
    const width = (dimensions.maxX - dimensions.minX + 1) * gridSize;
    const height = (dimensions.maxY - dimensions.minY + 1) * gridSize;
    
    return (
        <div className="mini-map-container">
            <h3>Map</h3>
            <div 
                className="mini-map"
                ref={mapRef}
                style={{ 
                    width: `${width}px`, 
                    height: `${height}px`,
                    position: 'relative'
                }}
            >
                {/* Render room connections first so they're behind the nodes */}
                {mapNodes.map(node => {
                    const nodeX = (node.x - dimensions.minX) * gridSize;
                    const nodeY = (node.y - dimensions.minY) * gridSize;
                    
                    return Object.entries(node.connections).map(([direction, targetId]) => {
                        if (!targetId) return null;
                        
                        // Find the target node to get its coordinates
                        const targetNode = mapNodes.find(n => n.roomId === targetId);
                        if (!targetNode) return null;
                        
                        // Calculate connection style based on relative positions
                        // This is more reliable than using the direction
                        const targetX = (targetNode.x - dimensions.minX) * gridSize;
                        const targetY = (targetNode.y - dimensions.minY) * gridSize;
                        
                        // Calculate mid points
                        const midX = (nodeX + targetX) / 2;
                        const midY = (nodeY + targetY) / 2;
                        
                        let connectionStyle = {};
                        
                        // Vertical connection
                        if (targetX === nodeX) {
                            const top = Math.min(nodeY, targetY) + gridSize / 2;
                            const height = Math.abs(targetY - nodeY);
                            
                            connectionStyle = {
                                left: `${nodeX + gridSize / 2 - borderWidth / 2}px`,
                                top: `${top}px`,
                                width: `${borderWidth}px`,
                                height: `${height}px`
                            };
                        } 
                        // Horizontal connection
                        else if (targetY === nodeY) {
                            const left = Math.min(nodeX, targetX) + gridSize / 2;
                            const width = Math.abs(targetX - nodeX);
                            
                            connectionStyle = {
                                left: `${left}px`,
                                top: `${nodeY + gridSize / 2 - borderWidth / 2}px`,
                                width: `${width}px`,
                                height: `${borderWidth}px`
                            };
                        }
                        
                        return (
                            <div 
                                key={`${node.roomId}-${direction}-${targetId}`}
                                className="room-connection"
                                style={{
                                    position: 'absolute',
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
                        bgColor = '#3a6ea5'; // Visited
                        border = '1px solid #5e9bda';
                    } else if (node.visibility === 'discovered') {
                        bgColor = '#304e6a'; // Discovered
                        border = '1px solid #436c96';
                    }
                    
                    // Highlight current room
                    const isCurrentRoom = node.roomId === gameState.currentRoom.id;
                    if (isCurrentRoom) {
                        bgColor = '#6ba5e7';
                        border = '2px solid #c4e0ff';
                    }
                    
                    // Create abbreviated room name if too long
                    const displayName = node.name.length > 8 
                        ? node.name.substring(0, 7) + '...' 
                        : node.name;
                    
                    return (
                        <div
                            key={node.roomId}
                            className={`map-node ${isCurrentRoom ? 'current' : ''}`}
                            title={node.name}
                            onClick={() => onRoomClick && onRoomClick(node.roomId)}
                            onMouseEnter={(e) => showTooltip(e, node.name)}
                            onMouseMove={(e) => showTooltip(e, node.name)}
                            onMouseLeave={hideTooltip}
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
                                fontSize: '12px',
                                color: '#fff',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                padding: '4px'
                            }}
                        >
                            {displayName}
                        </div>
                    );
                })}
                
                {/* Tooltip display */}
                {tooltip.visible && (
                    <div 
                        className="map-node-tooltip"
                        style={{
                            left: `${tooltip.x + 10}px`,
                            top: `${tooltip.y - 30}px`
                        }}
                    >
                        {tooltip.text}
                    </div>
                )}
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