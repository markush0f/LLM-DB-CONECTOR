import type { AssistantMessage, Conversation, UserMessage } from "../types/messages.types";

export function buildConversations(
    users: UserMessage[],
    assistants: AssistantMessage[]
): Conversation[] {
    return users.map(userMsg => ({
        userMessage: userMsg,
        assistantMessages: assistants.filter(
            a => a.user_message_id === userMsg.id
        ),
    }));
}
