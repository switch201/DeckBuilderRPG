/**
 * Represents a custom interaction that can be performed with a game object
 */
export type Interaction = {
    name: string;
    description: string;
    // The action to perform when this interaction is triggered
    execute: () => void;
} 