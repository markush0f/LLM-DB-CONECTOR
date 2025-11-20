export interface UserMessage {
    id: number;
    created_at: string;
    content: string;
    model_name: string;
}
export interface AssistantMessage {
    id: number;
    created_at: string;
    content: string;
    model_name: string;
    user_message_id: number;
    role: "assistant";
}

export interface Conversation {
    userMessage: UserMessage;
    assistantMessages: AssistantMessage[];
}

export interface ConversationStats {
    totalMessages: number;
    totalConversations: number;
    modelsUsed: string[];
}