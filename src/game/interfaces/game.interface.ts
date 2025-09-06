type Effect = {
    type: string;
    start: Date;
}

export interface GameElement {
    type: string;
    isInterractive: boolean;
    effects: Effect[];
}