import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatWindow.css';

function ChatWindow({ activeChat, chat, onLogout, onSendMessage, socketConnected }) {
  const [messages, setMessages] = useState([
    { _id: 'init', content: 'Hello! I\'m ZORO-AI. How can I help you today?', role: 'model', createdAt: new Date() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset messages when active chat changes
  useEffect(() => {
    setMessages([
      { _id: 'init', content: 'Hello! I\'m ZORO-AI. How can I help you today?', role: 'model', createdAt: new Date() },
    ]);
    setInputValue('');
  }, [activeChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChat || loading) return;

    const userMessage = {
      _id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const result = await onSendMessage(inputValue, activeChat);

      if (result.error) {
        const errorMessage = {
          _id: Date.now().toString() + '1',
          content: result.error || 'Sorry, I encountered an error. Please try again.',
          role: 'model',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const aiMessage = {
          _id: result.chat || Date.now().toString() + '1',
          content: result.content || 'I didn\'t understand that. Can you rephrase?',
          role: 'model',
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        _id: Date.now().toString() + '1',
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'model',
        createdAt: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  if (!chat) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h2>No Chat Selected</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-content">
          <h2>{chat.name}</h2>
          <div className="connection-status">
            <span className={`status-indicator ${socketConnected ? 'connected' : 'disconnected'}`}></span>
            {socketConnected ? 'Connected' : 'Connecting...'}
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`message ${message.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message ai-message">
            <div className="message-content loading">
              <span className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message here..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={loading || !socketConnected}
        />
        <button
          type="submit"
          className="send-button"
          disabled={loading || !socketConnected || !inputValue.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
