import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Chat.css';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import socketService from '../services/socketService';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, loading: authLoading } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection and fetch chats
  useEffect(() => {
    // Wait for auth context to load
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // Connect socket
      const socket = socketService.connect();
      
      socket.on('connect', () => {
        console.log('Socket connected');
        setSocketConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Fetch chats
      loadChats();

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('error');
      };
    } catch (error) {
      console.error('Failed to initialize:', error);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadChats = async () => {
    try {
      const data = await apiClient.getChats();
      setChats(data.chats || []);
      if (data.chats && data.chats.length > 0) {
        setActiveChat(data.chats[0]._id);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const chatName = `Chat ${new Date().toLocaleTimeString()}`;
      const data = await apiClient.createChat(chatName);
      
      if (!data || !data.chat) {
        throw new Error("Invalid response from server");
      }

      const newChat = {
        _id: data.chat._id,
        name: data.chat.name || chatName,
        lastMessage: 'Start a conversation...',
        createdAt: data.chat.createdAt,
      };
      
      setChats([newChat, ...chats]);
      setActiveChat(newChat._id);
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat: ' + error.message);
    }
  };

  const handleDeleteChat = (id) => {
    const filtered = chats.filter(chat => chat._id !== id);
    setChats(filtered);
    if (activeChat === id && filtered.length > 0) {
      setActiveChat(filtered[0]._id);
    } else if (filtered.length === 0) {
      setActiveChat(null);
    }
  };

  const handleStartEdit = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveName = (id) => {
    setChats(chats.map(chat => 
      chat._id === id ? { ...chat, name: editingName } : chat
    ));
    setEditingId(null);
  };

  const handleLogout = () => {
    socketService.disconnect();
    logout();
    navigate('/login');
  };

  const handleSendMessage = useCallback(async (message, chatId) => {
    if (!socketConnected) {
      return { error: 'Socket not connected. Please wait...' };
    }

    try {
      const response = await socketService.sendAIMessage(message, chatId);
      
      // Update last message in chat list
      setChats(prevChats =>
        prevChats.map(chat =>
          chat._id === chatId
            ? { ...chat, lastMessage: message }
            : chat
        )
      );

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      return { error: error.message || 'Failed to send message' };
    }
  }, [socketConnected]);

  if (loading) {
    return (
      <div className="chat-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <Sidebar 
        chats={chats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
        onEditChat={handleStartEdit}
        editingId={editingId}
        editingName={editingName}
        onEditingNameChange={setEditingName}
        onSaveName={handleSaveName}
        socketConnected={socketConnected}
      />
      {activeChat ? (
        <ChatWindow 
          activeChat={activeChat}
          chat={chats.find(c => c._id === activeChat)}
          onLogout={handleLogout}
          onSendMessage={handleSendMessage}
          socketConnected={socketConnected}
        />
      ) : (
        <div className="no-chat">
          <p>Select a chat or create a new one to get started</p>
        </div>
      )}
    </div>
  );
}

export default Chat;
