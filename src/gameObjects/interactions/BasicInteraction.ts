import type { Interaction } from './Interaction';

/**
 * A simple interaction implementation that can be used with JSON data
 */
export class BasicInteraction implements Interaction {
    private readonly _name: string;
    private readonly _description: string;
    private readonly _action: () => void;

    constructor(name: string, description: string, action?: () => void) {
        this._name = name;
        this._description = description;
        this._action = action || (() => console.log(`Executed interaction: ${name}`));
    }

    get name(): string {
        return this._name;
    }

    get description(): string {
        return this._description;
    }

    execute(): void {
        this._action();
    }
} 