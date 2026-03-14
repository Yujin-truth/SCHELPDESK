import { useState, useRef, useEffect } from 'react';
import API from '../services/api';

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your UNIASSIST helper. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await API.post('/chatbot/ask', { question: userMessage.content });

      let botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        timestamp: new Date()
      };

      if (response.data.type === 'faq_match') {
        botMessage.content = `**${response.data.category}**\n\n${response.data.answer}`;
        botMessage.confidence = response.data.confidence;
      } else if (response.data.type === 'handbook_match') {
        botMessage.content = `**From Student Handbook: ${response.data.title}**\n\n${response.data.content}`;
      } else if (response.data.type === 'no_match') {
        botMessage.content = response.data.message;
        botMessage.suggestions = response.data.suggestions;
      }

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later or submit a support ticket.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = () => {
    onClose();
    // Navigate to ticket creation - this would need to be handled by parent component
    window.location.href = '/student?tab=tickets&action=create';
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-container" onClick={e => e.stopPropagation()}>
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-avatar">
              <span>🤖</span>
            </div>
            <div>
              <h3>UNIASSIST Helper</h3>
              <p>Your AI support assistant</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>×</button>
        </div>

        <div className="chatbot-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.type === 'bot' && (
                  <div className="message-avatar">
                    <span>🤖</span>
                  </div>
                )}
                <div className="message-text">
                  <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }} />
                  {message.confidence && (
                    <div className="confidence-indicator">
                      Confidence: {Math.round(message.confidence * 100)}%
                    </div>
                  )}
                  {message.suggestions && (
                    <div className="suggestions">
                      <p><strong>Suggestions:</strong></p>
                      <ul>
                        {message.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {message.type === 'user' && (
                  <div className="message-avatar">
                    <span>👤</span>
                  </div>
                )}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message bot">
              <div className="message-content">
                <div className="message-avatar">
                  <span>🤖</span>
                </div>
                <div className="message-text typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about university services..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !inputMessage.trim()}>
            <span>📤</span>
          </button>
        </form>

        <div className="chatbot-footer">
          <button className="create-ticket-btn" onClick={handleCreateTicket}>
            Create Support Ticket
          </button>
        </div>
      </div>
    </div>
  );
}