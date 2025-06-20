import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot } from 'lucide-react';
import axios from 'axios';

const Chat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial bot message
    setMessages([{ text: "Hello! How can I help you today? You can ask me to set a reminder.", sender: 'bot' }]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);

    try {
      const response = await axios.post('/api/chat', {
        message: userMessage
      });

      // Add bot response
      setMessages(prev => [...prev, { text: response.data.reply, sender: 'bot' }]);
    } catch (err) {
      // Add error message
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot', error: true }]);
      console.error('Error in chat:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-4 min-h-screen">
      <div className="flex-1 overflow-y-auto mb-4 p-4 bg-background rounded-lg shadow-inner border border-primary/10">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={18} />
                </div>
              )}
              <div className={`px-4 py-2 rounded-xl max-w-lg bg-surface text-text-primary border border-primary/10 shadow-subtle ${msg.sender === 'user' ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                <p>{msg.text}</p>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <Bot size={18} />
              </div>
              <div className="px-4 py-2 rounded-xl bg-surface text-text-primary rounded-bl-none border border-primary/10 shadow-subtle">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 bg-primary rounded-full animate-bounce"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-2 bg-surface rounded-lg shadow-md border border-primary/10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
            placeholder="Ask to set a reminder..."
            className="w-full bg-transparent p-2 text-text-primary focus:outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-primary text-white shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat; 