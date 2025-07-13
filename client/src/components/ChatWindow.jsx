import React, { useEffect, useRef } from 'react';

// Reusable TypingIndicator component
const TypingIndicator = ({ party }) => (
  <div className={`typing-indicator ${party}`}>
    <span></span>
    <span></span>
    <span></span>
  </div>
);

const ChatWindow = ({ history, status }) => {
  const chatHistoryRef = useRef(null);

  // Automatically scroll to the bottom when history changes or status updates
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [history, status]);

  return (
    <div className="chat-container">
      <h3>Conversation</h3>
      <div className="chat-history" ref={chatHistoryRef}>
        {history.map((message, index) => (
          <div key={index} className={`message-bubble ${message.role}`}>
            <strong>{message.role === 'user' ? 'You' : 'Aura'}:</strong> {message.text}
          </div>
        ))}
        
        {/* ✅ Show indicator on Aura's side when processing */}
        {status === 'Processing...' && <TypingIndicator party="aura" />}

        {/* ✅ Show indicator on User's side when listening */}
        {status === 'Listening...' && <TypingIndicator party="user" />}
      </div>
      
      {/* The voice status div is now removed for a cleaner look */}
    </div>
  );
};

export default ChatWindow;