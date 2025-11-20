export async function getStats() {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/messages/stats`);

    if (!res.ok) {
        throw new Error("Failed to fetch stats");
    }

    return res.json();
}

export const deleteMessage = async (role: "user" | "assistant", id: number) => {
    const res = await fetch(`${import.meta.env.PUBLIC_API_URL}/messages/${role}/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to delete message");
    }

    return res.json();
};
