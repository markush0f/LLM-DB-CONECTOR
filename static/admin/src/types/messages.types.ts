export interface UserMessage {
    id: number;
    content: string;
    model_name: string;
    created_at: string;
}

export interface AssistantMessage {
    id: number;
    content: string;
    model_name: string;
    role: string;
    user_message_id: number;
    created_at: string;
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