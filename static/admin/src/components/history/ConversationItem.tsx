import type { Conversation } from "../../types/messages.types";
import { User, Bot } from "lucide-react";

interface Props {
  conversation: Conversation;
}

export default function ConversationItem({ conversation }: Props) {
  const { userMessage, assistantMessages } = conversation;

  // CHANGE: improved date formatting
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      {/* User Message */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          {/* CHANGE: replaced custom SVG with lucide icon */}
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-gray-900">User</span>

              <span className="text-xs text-gray-500">
                {formatDate(userMessage.created_at)}
              </span>

              {/* CHANGE: more elegant badge */}
              <span className="px-2 py-0.5 bg-blue-50 border border-blue-200 
                               text-blue-700 text-xs rounded-md font-medium">
                {userMessage.model_name}
              </span>
            </div>

            <p className="text-gray-900 text-[15px] leading-relaxed">
              {userMessage.content}
            </p>
          </div>
        </div>
      </div>

      {/* Assistant Messages */}
      <div className="space-y-6">
        {assistantMessages.map((assistantMsg) => (
          <div key={assistantMsg.id} className="flex items-start gap-3">
            {/* CHANGE: replaced custom SVG with lucide icon and modern gradient */}
            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold text-gray-900">Assistant</span>

                <span className="text-xs text-gray-500">
                  {formatDate(assistantMsg.created_at)}
                </span>

                <span className="px-2 py-0.5 bg-purple-50 border border-purple-200 
                                 text-purple-700 text-xs rounded-md font-medium">
                  {assistantMsg.model_name}
                </span>
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
