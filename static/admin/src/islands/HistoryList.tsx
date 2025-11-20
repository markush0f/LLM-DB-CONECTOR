"use client";

import ConversationItem from "../components/history/ConversationItem";
import { usePaginatedConversations } from "../hooks/usePaginatedConversations";

export default function HistoryList() {
    const { conversations, loadMore, loading, hasMore } =
        usePaginatedConversations();

    return (
        <div className="space-y-8">
            {conversations.map(conv => (
                <div key={conv.userMessage.id}>
                    <ConversationItem conversation={conv} />

                    {/* CHANGE: separator under each conversation */}
                    <hr className="mt-6 border-gray-300" />
                </div>
            ))}

            {hasMore && (
                <button
                    onClick={loadMore}
                    className="w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
                >
                    {loading ? "Loading..." : "Load more"}
                </button>
            )}
        </div>
    );

}
