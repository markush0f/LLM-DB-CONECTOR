import { useEffect, useState } from "react";
import type {
    UserMessage,
    AssistantMessage,
    Conversation,
} from "../types/messages.types";
import { buildConversations } from "../utils/buildConversations.ts";

export function usePaginatedConversations(limit: number = 10) {
    const [data, setData] = useState<Conversation[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const load = async () => {
        if (loading) return;

        setLoading(true);

        const usersRes = await fetch(
            `${import.meta.env.PUBLIC_API_URL}/messages/user?page=${page}&limit=${limit}`
        );
        const assistantsRes = await fetch(
            `${import.meta.env.PUBLIC_API_URL}/messages/assistant?page=${page}&limit=${limit}`
        );

        const users: UserMessage[] = await usersRes.json();
        const assistants: AssistantMessage[] = await assistantsRes.json();

        const conversations = buildConversations(users, assistants);

        if (conversations.length < limit) setHasMore(false);

        setData(prev => [...prev, ...conversations]);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [page]);

    const loadMore = () => {
        if (hasMore) setPage(prev => prev + 1);
    };

    return { conversations: data, loadMore, loading, hasMore };
}
