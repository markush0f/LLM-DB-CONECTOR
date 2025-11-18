export interface DBConnection {
    id: string;
    name: string;
    type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
    host: string;
    port: number;
    database: string;
    username: string;
    status: 'connected' | 'disconnected' | 'error';
    lastConnected?: string;
    createdAt: string;
}

export interface DBConnectionForm {
    name: string;
    type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite';
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}