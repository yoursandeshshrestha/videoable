import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { sendChatMessage, addUserMessage } from "../../store/slices/chatSlice";
import { showNotification } from "../../store/slices/uiSlice";
import { Send, MessageSquare } from "lucide-react";

interface ChatInterfaceProps {
  sessionId: number;
}

const ChatInterface = ({ sessionId }: ChatInterfaceProps) => {
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.chat);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");

    // Add user message immediately
    dispatch(addUserMessage(message));

    try {
      await dispatch(sendChatMessage({ sessionId, message })).unwrap();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send message";
      dispatch(
        showNotification({
          message: errorMessage,
          type: "error",
        })
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-[#37322f]/10">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#37322f]/10 shrink-0">
        <h2 className="text-base font-medium text-[#37322f]">Chat to Edit</h2>
        <p className="text-xs text-[#37322f]/50 mt-0.5">
          Use natural language to edit subtitles
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare
                size={40}
                className="text-[#37322f]/15 mx-auto mb-3"
              />
              <p className="text-sm text-[#37322f]/50">
                Start chatting to edit your video
              </p>
              <p className="text-xs text-[#37322f]/40 mt-1.5 max-w-xs">
                Try: "Generate subtitles" or "Add subtitle 'Hello' at 0s"
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm ${
                  message.role === "user"
                    ? "bg-[#37322f] text-white"
                    : "bg-[#f7f5f3] text-[#37322f]"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
                {message.subtitles && message.subtitles.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/15 text-xs opacity-70">
                    {message.subtitles.length} subtitle(s) updated
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="text-sm text-[#37322f]/60 animate-pulse px-3.5 py-6.5">
              Processing your request...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-[#37322f]/10 shrink-0"
      >
        {/* Quick Actions */}
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInput("Generate subtitles from audio")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Generate subtitles
          </button>
          <button
            type="button"
            onClick={() =>
              setInput("Add subtitle 'Hello World' from 0 to 5 seconds")
            }
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Add subtitle
          </button>
          <button
            type="button"
            onClick={() => setInput("Make font size 32 and bold")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Change font size
          </button>
          <button
            type="button"
            onClick={() => setInput("Move subtitles to the bottom")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Move to bottom
          </button>
          <button
            type="button"
            onClick={() => setInput("Change text color to yellow")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Change color
          </button>
          <button
            type="button"
            onClick={() => setInput("Add white background to subtitles")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Add background
          </button>
          <button
            type="button"
            onClick={() => setInput("Remove background from text")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Remove background
          </button>
          <button
            type="button"
            onClick={() => setInput("Make subtitles appear at the top")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Move to top
          </button>
          <button
            type="button"
            onClick={() => setInput("Add black outline to text")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Add outline
          </button>
          <button
            type="button"
            onClick={() => setInput("Center the subtitles")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Center subtitles
          </button>
          <button
            type="button"
            onClick={() => setInput("Move up 25px")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Move up 25px
          </button>
          <button
            type="button"
            onClick={() => setInput("Move down 25px")}
            className="px-3 py-1.5 text-xs bg-[#f7f5f3] hover:bg-[#37322f]/10 text-[#37322f] rounded-full transition-colors"
            disabled={loading}
          >
            Move down 25px
          </button>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3.5 py-2.5 text-sm border border-[#37322f]/20 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#37322f]/40 focus:border-[#37322f]/40 bg-white text-[#37322f] placeholder:text-[#37322f]/40"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-[#37322f] hover:bg-[#37322f]/90 disabled:bg-[#37322f]/50 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
