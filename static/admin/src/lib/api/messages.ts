export async function getStats() {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/messages/stats`);

    if (!res.ok) {
        throw new Error("Failed to fetch stats");
    }

    return res.json();
}
