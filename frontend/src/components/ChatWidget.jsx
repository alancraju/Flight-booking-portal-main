import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Plane, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_RESPONSES = [
    { keywords: ['hi', 'hello', 'hey'], response: "Hello there! I'm your AI Travel Assistant. How can I help you plan your next trip?" },
    { keywords: ['cheap', 'budget', 'offer'], response: "Looking for budget options? I recommend checking out flights to Goa or Jaipur. Shall I take you to the search page?" },
    { keywords: ['beach', 'sea', 'goa', 'kerala'], response: "Ah, craving some sun and sand! Goa and Kerala are our top beach destinations. I've highlighted them on the home page for you!" },
    { keywords: ['delhi', 'mumbai', 'bangalore'], response: "Major city travels! We have frequent flights between Delhi, Mumbai, and Bangalore. Would you like to search for flights now?" },
    { keywords: ['book', 'ticket', 'flight'], response: "To book a flight, just use the search bar on our home page to find your route, then follow the easy 3-step booking process!" },
];

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, type: 'bot', text: "Hi! I'm your AI Travel Assistant. Where would you like to fly today?" }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI thinking
        setTimeout(() => {
            let botReply = "I'm not entirely sure about that. Try asking about booking flights, cheap destinations, or beaches!";
            
            const lowerInput = userMsg.text.toLowerCase();
            for (let item of MOCK_RESPONSES) {
                if (item.keywords.some(kw => lowerInput.includes(kw))) {
                    botReply = item.response;
                    break;
                }
            }

            setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: botReply }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden flex flex-col"
                        style={{ height: '500px', maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 text-white flex justify-between items-center shadow-md z-10">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <Bot className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold">Travel Assistant</h3>
                                    <p className="text-xs text-blue-200">Online • Ready to help</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map(msg => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-gray-200' : 'bg-blue-100 text-blue-600'}`}>
                                            {msg.type === 'user' ? <User className="h-4 w-4 text-gray-500" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm shadow-sm ${msg.type === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                            {msg.text}
                                            
                                            {/* Action Buttons for specific bot responses */}
                                            {msg.type === 'bot' && msg.text.includes("search page") && (
                                                <button onClick={() => navigate('/search')} className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 px-4 rounded-xl text-xs hover:bg-blue-100 transition-colors border border-blue-200">
                                                    Go to Search
                                                </button>
                                            )}
                                            {msg.type === 'bot' && msg.text.includes("Goa") && msg.text.includes("budget") && (
                                                <button onClick={() => navigate('/destination/goa')} className="mt-3 w-full bg-blue-50 text-blue-700 font-bold py-2 px-4 rounded-xl text-xs hover:bg-blue-100 transition-colors border border-blue-200">
                                                    Explore Goa
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Actions */}
                        {messages.length < 3 && (
                            <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-gray-100 bg-white">
                                <button onClick={() => setInput("Find cheap flights")} className="whitespace-nowrap flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                                    <Plane className="h-3 w-3" /><span>Cheap flights</span>
                                </button>
                                <button onClick={() => setInput("Best beaches")} className="whitespace-nowrap flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors">
                                    <MapPin className="h-3 w-3" /><span>Beaches</span>
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-gray-100">
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center space-x-2 relative"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-800"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-4 w-4 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full shadow-2xl shadow-blue-500/50 flex items-center justify-center text-white border-2 border-white/20 z-50 relative"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
                {!isOpen && (
                    <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
