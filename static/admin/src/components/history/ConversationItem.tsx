import { useState } from "react";
import { deleteMessage } from "../../lib/api/messages";
import type { Conversation } from "../../types/messages.types";
import { User, Bot, Trash2 } from "lucide-react";

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const [localUserMessage, setLocalUserMessage] = useState(conversation.userMessage);
  const [localAssistantMessages, setLocalAssistantMessages] = useState(conversation.assistantMessages);

  const handleDelete = async (role: "user" | "assistant", id: number) => {
    if (role === "user") {
      const prev = localUserMessage;
      setLocalUserMessage(null);

      try {
        await deleteMessage(role, id);
      } catch {
        setLocalUserMessage(prev);
      }
    }

    if (role === "assistant") {
      const prev = [...localAssistantMessages];
      const updated = prev.filter((m) => m.id !== id);
      setLocalAssistantMessages(updated);

      try {
        await deleteMessage(role, id);
      } catch {
        setLocalAssistantMessages(prev);
      }
    }
  };

  // CHANGE: hide full conversation if empty
  if (!localUserMessage && localAssistantMessages.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">

      {/* USER MESSAGE — LEFT */}
      {localUserMessage && (
        <div className="mb-4 flex justify-start">
          <div className="max-w-[80%] bg-blue-50 border border-blue-200 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>

              <span className="text-sm font-semibold text-blue-700">User</span>

              <span className="text-xs text-gray-500">
                {formatDate(localUserMessage.created_at)}
              </span>

              <button
                onClick={() => handleDelete("user", localUserMessage.id)}
                className="text-red-500 hover:text-red-700 transition ml-auto"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <p className="text-gray-900 text-[15px] leading-relaxed">
              {localUserMessage.content}
            </p>
          </div>
        </div>
      )}

      {/* ASSISTANT MESSAGES — RIGHT */}
      <div className="space-y-4">
        {localAssistantMessages.map((assistantMsg) => (
          <div key={assistantMsg.id} className="flex justify-end">
            <div className="max-w-[80%] bg-purple-50 border border-purple-200 p-3 rounded-xl shadow-sm">

              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>

                <span className="text-sm font-semibold text-purple-700">Assistant</span>

                <span className="text-xs text-gray-500">
                  {formatDate(assistantMsg.created_at)}
                </span>

                <button
                  onClick={() => handleDelete("assistant", assistantMsg.id)}
                  className="text-red-500 hover:text-red-700 transition ml-auto"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p className="text-gray-900 text-[15px] leading-relaxed whitespace-pre-wrap">
                {assistantMsg.content}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );

}
