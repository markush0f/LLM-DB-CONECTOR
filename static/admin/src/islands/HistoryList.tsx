import { useState } from "react";
import ConversationItem from "../components/history/ConversationItem";
import type { Conversation } from "../types/messages.types";
import { Search } from "lucide-react";

interface Props {
    initialConversations: Conversation[];
    heightPercentage?: number;
}

export default function HistoryList({ initialConversations, heightPercentage = 65 }: Props) {
    const [conversations] = useState<Conversation[]>(initialConversations);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredConversations = conversations.filter(conv =>
        conv.userMessage.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.assistantMessages.some(msg =>
            msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />

                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-10 py-2.5 
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                </div>
            </div>

            <div
                className="bg-white rounded-xl border border-gray-200 p-0 overflow-y-auto"
                style={{ maxHeight: `${heightPercentage}vh` }}
            >
                {filteredConversations.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredConversations.map((conversation) => (
                            <ConversationItem
                                key={conversation.userMessage.id}
                                conversation={conversation}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-14 px-4">
                        <Search className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No conversations found
                        </h3>
                        <p className="text-gray-600 text-sm">
                            {searchTerm ? "Try adjusting your search terms" : "No conversation history available yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
