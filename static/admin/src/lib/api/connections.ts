import type { DBConnection } from "../../types/DBConnection.types";

export const mockConnections: DBConnection[] = [
    {
        id: "1",
        name: "Production Database",
        type: "postgresql",
        host: "prod-db.example.com",
        port: 5432,
        database: "production_db",
        username: "admin",
        status: "connected",
        lastConnected: "2025-11-18 10:30:00",
        createdAt: "2025-01-15 08:00:00"
    },
    {
        id: "2",
        name: "Staging Database",
        type: "postgresql",
        host: "staging-db.example.com",
        port: 5432,
        database: "staging_db",
        username: "staging_user",
        status: "connected",
        lastConnected: "2025-11-18 09:15:00",
        createdAt: "2025-02-10 14:30:00"
    },
    {
        id: "3",
        name: "Analytics DB",
        type: "mysql",
        host: "analytics.example.com",
        port: 3306,
        database: "analytics",
        username: "analytics_user",
        status: "disconnected",
        lastConnected: "2025-11-17 18:45:00",
        createdAt: "2025-03-05 11:20:00"
    },
    {
        id: "4",
        name: "MongoDB Logs",
        type: "mongodb",
        host: "mongo.example.com",
        port: 27017,
        database: "logs",
        username: "mongo_admin",
        status: "error",
        lastConnected: "2025-11-18 08:00:00",
        createdAt: "2025-04-12 09:00:00"
    }
];

export const getConnections = async (): Promise<DBConnection[]> => {
    // Simulación de API call
    return new Promise((resolve) => {
        setTimeout(() => resolve(mockConnections), 500);
    });
};