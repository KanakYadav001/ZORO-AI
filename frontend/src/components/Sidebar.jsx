import React from 'react';
import '../styles/Sidebar.css';

function Sidebar({ 
  chats, 
  activeChat, 
  onSelectChat, 
  onCreateChat, 
  onDeleteChat, 
  onEditChat,
  editingId,
  editingName,
  onEditingNameChange,
  onSaveName,
  socketConnected
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-text">⚔️ ZORO-AI</span>
        </div>
        <div className={`connection-badge ${socketConnected ? 'connected' : 'disconnected'}`}>
          {socketConnected ? '🟢 Online' : '🔴 Offline'}
        </div>
      </div>

      <button className="new-chat-btn" onClick={onCreateChat}>
        <span className="plus-icon">+</span> New Chat
      </button>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty-state">
            <p>No chats yet</p>
            <p className="empty-hint">Create a new chat to get started</p>
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat._id}
              className={`chat-item ${activeChat === chat._id ? 'active' : ''}`}
              onDoubleClick={() => onEditChat(chat._id, chat.name)}
            >
              <div className="chat-item-content" onClick={() => onSelectChat(chat._id)}>
                {editingId === chat._id ? (
                  <input
                    type="text"
                    className="edit-chat-input"
                    value={editingName}
                    onChange={(e) => onEditingNameChange(e.target.value)}
                    onBlur={() => onSaveName(chat._id)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') onSaveName(chat._id);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="chat-name">{chat.name}</div>
                    <div className="chat-preview">{chat.lastMessage}</div>
                  </>
                )}
              </div>
              <button 
                className="delete-chat-btn"
                onClick={() => onDeleteChat(chat._id)}
                title="Delete chat"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Sidebar;
