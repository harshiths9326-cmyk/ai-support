"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Role = "user" | "assistant";
interface Message {
  id: string;
  role: Role;
  content: string;
}

export default function ChatInterface({ chunks }: { chunks: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, errorMsg]);

  // Robust, manual chat fetch hook
  const sendMessage = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!input || !input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, documentChunks: chunks }),
      });

      if (!response.ok) {
        let errStr = "Server error";
        try {
          const resJson = await response.json();
          errStr = resJson.error || errStr;
        } catch { }
        throw new Error(errStr + " (Status " + response.status + ")");
      }

      if (!response.body) throw new Error("No response body streamed");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      let assistantMessageContent = "";
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: "" }
      ]);
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse Vercel AI SDK protocol (0:"text" lines)
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              // The text after 0: is a JSON string
              assistantMessageContent += JSON.parse(line.substring(2));
            } catch (e) {
              // Fallback
              assistantMessageContent += line.substring(2).replace(/^"|"$/g, '');
            }
          } else if (line.trim() !== '' && !line.match(/^[a-z]:/)) {
             // Catch-all for plain text if protocol is missing
             assistantMessageContent += line;
          }
        }
        
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex].role === "assistant") {
            updated[lastIndex].content = assistantMessageContent;
          }
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Chat Failed:", err);
      setErrorMsg(err.message || String(err));
      alert("Chat connection error: " + (err.message || String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-3xl mx-auto glass-card overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-full">
              <Bot className="w-12 h-12 text-primary/80" />
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-slate-200">Knowledge Base Loaded</p>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                Ask me anything! I will provide answers referencing only the document you just uploaded.
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              key={m.id}
              className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md",
                  m.role === "user" ? "bg-gradient-to-br from-primary to-blue-600 text-white" : "bg-gradient-to-br from-slate-700 to-slate-800 text-accent border border-slate-600"
                )}
              >
                {m.role === "user" ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div
                className={cn(
                  "p-4 rounded-2xl whitespace-pre-wrap text-[15px] leading-relaxed shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-slate-800/90 border border-slate-700/50 text-slate-200 rounded-tl-sm backdrop-blur-sm"
                )}
              >
                {m.content}
              </div>
            </motion.div>
          ))
        )}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 max-w-[85%]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-accent border border-slate-600 flex items-center justify-center shrink-0 shadow-md">
              <Bot size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/50 text-slate-200 rounded-tl-sm flex items-center gap-3 backdrop-blur-sm shadow-sm">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm font-medium bg-clip-text text-transparent bg-gradient-to-r from-slate-300 to-slate-500 animate-pulse">
                Analyzing document...
              </span>
            </div>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 max-w-[85%]"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle size={20} />
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-200 rounded-tl-sm flex flex-col gap-1 backdrop-blur-sm shadow-sm">
              <span className="font-semibold text-rose-400 text-sm">Connection Error</span>
              <span className="text-sm text-slate-300">{errorMsg}</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      <div className="p-4 sm:p-6 border-t border-slate-700/50 bg-slate-900/60 backdrop-blur-md">
        <form onSubmit={sendMessage} className="relative flex items-center max-w-4xl mx-auto">
          <input
            className="w-full bg-slate-800/80 border border-slate-600 focus:border-primary/50 rounded-full py-4 px-6 pr-14 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner text-base"
            value={input}
            placeholder="Ask a question about your document..."
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input?.trim()}
            className="absolute right-2 p-3 bg-primary text-primary-foreground rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-primary transition-all shadow-md group"
          >
            <Send size={18} className="translate-y-[1px] -translate-x-[1px] group-hover:translate-x-[1px] group-hover:-translate-y-[1px] transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
}
