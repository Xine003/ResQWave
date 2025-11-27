import { useState, useEffect, useRef } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI with token from environment variable
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface Message {
    id: number;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export function ChatbotConvo() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Show initial greeting when chat opens
    useEffect(() => {
        if (!isOpen || messages.length > 0) return;

        const showGreeting = setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
                const greetingMessage: Message = {
                    id: 1,
                    text: "Hi there! I'm ResQWave Assistant. How can I help you today?",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages([greetingMessage]);
                setIsTyping(false);
            }, 1000);
        }, 500);

        return () => clearTimeout(showGreeting);
    }, [isOpen, messages.length]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === "") return;

        const userMessage: Message = {
            id: messages.length + 1,
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        const userQuestion = inputValue;
        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Use Gemini 1.5 Flash model (stable version)
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            // Create context about ResQWave for better responses
            const context = `You are ResQWave Assistant, an AI helper for ResQWave - a LoRa-powered emergency communication system designed to help communities send SOS alerts, share updates, and guide rescuers during flood events. Our terminals work even when cellular networks fail. 
      
Key features:
- LoRa technology with long-range communication
- Works without internet or cellular networks
- Emergency SOS alerts for flood situations
- Real-time location tracking for rescue teams
- Community-based disaster response

Answer the following question helpfully and concisely (2-3 sentences max): ${userQuestion}`;

            const result = await model.generateContent(context);
            const response = await result.response;
            const aiResponse = response.text();

            const botMessage: Message = {
                id: messages.length + 2,
                text: aiResponse,
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Error calling Gemini AI:", error);
            console.error("Error details:", error instanceof Error ? error.message : String(error));

            // Fallback response if AI fails
            const botMessage: Message = {
                id: messages.length + 2,
                text: "I apologize, but I'm having trouble connecting right now. ResQWave is a LoRa-powered emergency communication system that helps communities during floods. Please try asking your question again, or contact our support team for immediate assistance.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Floating Chat Widget */}
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    right: "24px",
                    zIndex: 9999,
                }}
            >
                {/* Chat Window */}
                {isOpen && (
                    <div
                        className="mb-2 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
                        style={{
                            width: "380px",
                            maxWidth: "calc(100vw - 48px)",
                            background: "rgba(30, 30, 35, 0.95)",
                            backdropFilter: "blur(20px)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        {/* Chat Header */}
                        <div
                            className="px-4 py-3 border-b flex items-center justify-between"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-blue-600"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">ResQWave Assistant</h3>
                                    <p className="text-xs text-blue-100">Online</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="px-4 py-4 overflow-y-auto"
                            style={{ height: "400px", maxHeight: "60vh" }}
                        >
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-3 py-2 ${message.sender === "user"
                                            ? "bg-gradient-to-br from-blue-600 to-blue-500 text-white"
                                            : "bg-gray-700/50 text-gray-100"
                                            }`}
                                        style={{
                                            boxShadow:
                                                message.sender === "user"
                                                    ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                                                    : "0 2px 6px rgba(0, 0, 0, 0.2)",
                                        }}
                                    >
                                        <p className="text-sm leading-relaxed">{message.text}</p>
                                        <p
                                            className={`text-xs mt-1 ${message.sender === "user"
                                                ? "text-blue-100"
                                                : "text-gray-400"
                                                }`}
                                        >
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="mb-3 flex justify-start">
                                    <div
                                        className="bg-gray-700/50 rounded-2xl px-4 py-3"
                                        style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)" }}
                                    >
                                        <div className="flex gap-1">
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "0ms" }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "150ms" }}
                                            />
                                            <div
                                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                                style={{ animationDelay: "300ms" }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div
                            className="px-4 py-3 border-t"
                            style={{
                                background: "rgba(20, 20, 25, 0.6)",
                                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-800/50 text-white rounded-full px-4 py-2 text-sm outline-none border border-gray-700 focus:border-blue-500 transition-colors"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                                    style={{ boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)" }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Chat Toggle Button - Only show when chat is closed */}
                {!isOpen && (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-gradient-to-br from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-full p-4 shadow-2xl transition-all duration-200 hover:scale-110 active:scale-95"
                        style={{ boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)" }}
                    >
                        <MessageCircle size={28} />
                    </button>
                )}
            </div>
        </>
    );
}
