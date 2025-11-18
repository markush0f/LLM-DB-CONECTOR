// CHANGE: connection-related TS definitions

export interface PGDBConnector {
    name?: string;
    host: string;
    port: number;
    user: string;
    database: string;
}

export interface SavedConnection {
    id: number;
    name: string;
    host: string;
    port: number;
    user: string;
    database: string;
}

export interface ConnectionListResponse {
    total: number;
    connections: SavedConnection[];
}

export interface ActivateResponse {
    status: string;
    message: string;
    active_connection: SavedConnection;
}
