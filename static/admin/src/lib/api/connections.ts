import type { PGDBConnector, ConnectionListResponse, ActivateResponse } from "../../types/DBConnection.types";
import { handleAPIError } from "../../utils/errors";


export async function saveConnection(config: PGDBConnector) {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
    });

    await handleAPIError(res);
    return res.json();
}

export async function listConnections(): Promise<ConnectionListResponse> {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/list`);
    await handleAPIError(res);
    return res.json();
}

export async function deleteConnection(id: number) {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/${id}`, {
        method: "DELETE"
    });

    await handleAPIError(res);
    return res.json();
}

export async function useConnection(
    id: number,
    password: string
): Promise<ActivateResponse> {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/use/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
    });

    await handleAPIError(res);
    return res.json();
}

export async function disconnectConnection() {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/disconnect`, {
        method: "POST"
    });

    await handleAPIError(res);
    return res.json();
}
