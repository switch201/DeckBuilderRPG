import type { Interaction } from './Interaction';

/**
 * Properties for creating a BasicInteraction
 */
export type BasicInteractionProps = {
    name: string;
    description: string;
    action?: () => void;
}

/**
 * A simple interaction implementation that can be used with JSON data
 */
export class BasicInteraction implements Interaction {
    private readonly _name: string;
    private readonly _description: string;
    private readonly _action: () => void;

    constructor(props: BasicInteractionProps) {
        this._name = props.name;
        this._description = props.description;
        this._action = props.action || (() => console.log(`Executed interaction: ${props.name}`));
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