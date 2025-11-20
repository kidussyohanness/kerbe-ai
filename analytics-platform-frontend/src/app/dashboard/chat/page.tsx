"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiService } from "@/lib/api";
import { Send, TrendingUp, DollarSign, Package, Users, Loader2, Bot, User, AlertCircle } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

const suggestedQuestions = [
  {
    icon: <DollarSign className="w-5 h-5" />,
    question: "How is my business doing financially?",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30"
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    question: "What are my best selling products?",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30"
  },
  {
    icon: <Package className="w-5 h-5" />,
    question: "Do I have enough inventory?",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30"
  },
  {
    icon: <Users className="w-5 h-5" />,
    question: "Who are my top customers?",
    color: "from-orange-500/20 to-amber-500/20 border-orange-500/30"
  }
];

export default function ChatPage() {
  const { data: session } = useSession();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Financial Analysis", timestamp: "2 hours ago", preview: "How is my business doing financially?" },
    { id: 2, title: "Cash Flow Questions", timestamp: "Yesterday", preview: "What's my current cash position?" },
    { id: 3, title: "KPI Discussion", timestamp: "3 days ago", preview: "Explain my profit margins" },
    { id: 4, title: "Revenue Trends", timestamp: "1 week ago", preview: "Show me revenue trends" },
    { id: 5, title: "Budget Planning", timestamp: "2 weeks ago", preview: "Help with budget planning" }
  ]);

  // Get userId from session
  const userId = (session?.user as { id?: string })?.id;

  // Load chat history on component mount or when userId changes
  useEffect(() => {
    if (userId) {
      loadChatHistory();
    } else {
      setLoadingHistory(false);
      setHistoryError("Please sign in to view chat history");
    }
  }, [userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadChatHistory = async () => {
    if (!userId) {
      setHistoryError("User ID not available");
      setLoadingHistory(false);
      return;
    }

    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const response = await apiService.getChatHistory(userId);
      if (response.success) {
        setMessages(response.data?.messages || []);
        setHistoryError(null);
      } else {
        const errorMsg = response.error || "Failed to load chat history";
        setHistoryError(errorMsg);
        console.error("Failed to load chat history:", errorMsg);
        // Don't show error if it's just empty history
        if (errorMsg.includes("Missing") || errorMsg.includes("Invalid")) {
          setMessages([]);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to load chat history";
      setHistoryError(errorMsg);
      console.error("Failed to load chat history:", error);
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const ask = async () => {
    if (!question.trim() || busy) return;
    
    if (!userId) {
      setHistoryError("Please sign in to use the chat");
      return;
    }
    
    const userMessage: ChatMessage = { role: "user", content: question };
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setBusy(true);
    setHistoryError(null); // Clear any previous errors

    // Add to chat history if this is the first message in a new conversation
    if (messages.length === 0) {
      const title = currentQuestion.length > 30 ? currentQuestion.substring(0, 30) + "..." : currentQuestion;
      addToChatHistory(title, currentQuestion);
    }

    try {
      const response = await apiService.askQuestion(currentQuestion, userId);
      
      if (response.success) {
        const assistantMessage: ChatMessage = { 
          role: "assistant", 
          content: response.data.answer ?? "I couldn't process your request." 
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        // Enhanced error messages
        let errorText = "Sorry, I encountered an issue. ";
        
        if (response.error?.includes('Missing x-company-id')) {
          errorText += "Connection issue detected. Please refresh the page and try again.";
        } else if (response.error?.includes('Empty question')) {
          errorText += "Please enter a question.";
        } else if (response.error?.includes('API error')) {
          errorText += "AI service is temporarily unavailable. Please try again in a moment.";
        } else if (response.error?.includes('Rate limit') || response.error?.includes('429')) {
          errorText += "Too many requests. Please wait a moment before trying again.";
        } else if (response.error) {
          errorText += `Error: ${response.error}`;
        } else {
          errorText += "Please try again.";
        }
        
        const errorMessage: ChatMessage = { 
          role: "assistant", 
          content: errorText
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorText = "Sorry, I'm having trouble connecting. ";
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorText += "Please check your internet connection and try again.";
        } else {
          errorText += "Please try again in a moment.";
        }
      } else {
        errorText += "Please try again.";
      }
      
      const errorMessage: ChatMessage = { 
        role: "assistant", 
        content: errorText
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      ask();
    }
  };

  const handleSuggestedQuestion = (q: string) => {
    setQuestion(q);
    inputRef.current?.focus();
  };

  const addToChatHistory = (title: string, preview: string) => {
    const newChat = {
      id: Date.now(),
      title,
      timestamp: "Just now",
      preview
    };
    setChatHistory(prev => [newChat, ...prev.slice(0, 4)]); // Keep only 5 most recent
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
        {/* Chat History Sidebar - More Compact */}
        <div className="w-full lg:w-72 bg-glass-bg-secondary/50 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-xl">
          <div className="p-5 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-text-primary">Recent Chats</h2>
              <button
                onClick={() => {
                  setMessages([]);
                  setQuestion("");
                  setHistoryError(null);
                }}
                className="text-xs bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30 text-accent-blue px-3 py-1.5 rounded-lg transition-all font-medium"
              >
                New
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                No recent chats
              </div>
            ) : (
              <div className="space-y-1.5">
                {chatHistory.map((chat) => (
                  <div 
                    key={chat.id}
                    className="glass-card p-3 cursor-pointer hover:bg-white/5 transition-all rounded-lg group border border-transparent hover:border-white/10"
                    onClick={() => {
                      setQuestion(chat.preview);
                      inputRef.current?.focus();
                    }}
                  >
                    <div className="text-sm font-medium text-text-primary group-hover:text-accent-blue transition-colors line-clamp-1">
                      {chat.title}
                    </div>
                    <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                      {chat.preview}
                    </div>
                    <div className="text-xs text-text-secondary/60 mt-2">
                      {chat.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Container */}
        <div className="flex-1 glass-card flex flex-col overflow-hidden rounded-2xl shadow-xl border border-white/10">
          {/* Error Banner */}
          {historyError && (
            <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{historyError}</span>
              <button
                onClick={() => {
                  setHistoryError(null);
                  if (userId) loadChatHistory();
                }}
                className="text-red-300 hover:text-red-200 underline text-xs font-medium"
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Loading State */}
          {loadingHistory && (
            <div className="mx-4 mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2 text-blue-400 text-sm backdrop-blur-sm">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span>Loading chat history...</span>
            </div>
          )}
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
                {/* Welcome State - More Elegant */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-blue via-accent-purple to-accent-blue rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-accent-blue/20">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Welcome to KAI
                </h2>
                <p className="text-text-secondary mb-8 max-w-lg text-sm leading-relaxed">
                  Your intelligent financial assistant. Ask questions about your business data and get instant insights.
                </p>

                {/* Suggested Questions - Cleaner Design */}
                <div className="w-full max-w-2xl mb-6">
                  <p className="text-xs text-text-secondary/70 mb-4 font-medium uppercase tracking-wider">Suggested Questions</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedQuestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(item.question)}
                        className="glass-card border border-white/10 hover:border-white/20 p-3 rounded-lg hover:bg-white/5 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg group-hover:from-accent-blue/30 group-hover:to-accent-purple/30 transition-all">
                            {item.icon}
                          </div>
                          <p className="text-sm text-text-primary group-hover:text-accent-blue transition-colors flex-1 text-left">
                            {item.question}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Reminder - Subtle */}
                <div className="mt-4 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-lg max-w-md">
                  <p className="text-xs text-text-secondary/80">
                    💡 <span className="font-medium">Tip:</span> Upload financial documents for personalized insights
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 items-start ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center shadow-sm">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[75%] lg:max-w-[65%] px-4 py-2.5 rounded-xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-accent-blue to-accent-purple text-white shadow-md"
                          : "glass-card border border-white/10 bg-white/5 text-text-primary"
                      }`}
                    >
                      <div className={`whitespace-pre-wrap text-sm leading-relaxed ${
                        message.role === "user" ? "text-white" : "text-text-primary"
                      }`}>
                        {message.content}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent-orange to-accent-pink rounded-lg flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                
                {busy && (
                  <div className="flex gap-3 justify-start items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center shadow-sm">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="glass-card border border-white/10 bg-white/5 px-4 py-2.5 rounded-xl">
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section - Cleaner Design */}
          <div className="border-t border-white/10 p-4 bg-glass-bg-secondary/30 backdrop-blur-sm">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  className="w-full glass-input px-4 py-3 text-sm rounded-xl focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue/50 transition-all placeholder:text-text-secondary/50"
                  placeholder="Type your message..."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={busy}
                />
              </div>
              <button
                className={`p-3 rounded-xl transition-all ${
                  busy || !question.trim()
                    ? "bg-gray-500/20 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:shadow-lg hover:scale-105 active:scale-95"
                }`}
                onClick={ask}
                disabled={busy || !question.trim()}
              >
                {busy ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-text-secondary/60 mt-2 text-center">
              Press Enter to send
            </p>
          </div>
        </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
