import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPaperPlane, FaCog, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import MessageBubble from '../components/MessageBubble';
import { chatApi } from '../utils/api';

const ChatDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [models, setModels] = useState([]);
  const messagesEndRef = useRef(null);
  const [relevantDocs, setRelevantDocs] = useState([]);
  const [showRelevantDocs, setShowRelevantDocs] = useState(false);
  
  // Settings state
  const [chatTitle, setChatTitle] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [useRAG, setUseRAG] = useState(true);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await chatApi.getChatById(id);
        setChat(response.data.chat);
        setChatTitle(response.data.chat.title);
        setSelectedModel(response.data.chat.model);
        setUseRAG(response.data.chat.useRAG);
      } catch (err) {
        console.error('Error fetching chat:', err);
        setError('Failed to load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id]);

  // Load available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await chatApi.getModels();
        setModels(response.data.models || []);
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };

    fetchModels();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  // Send a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      const response = await chatApi.sendMessage(id, message);
      
      // Update chat with new messages
      setChat(prevChat => ({
        ...prevChat,
        messages: [
          ...prevChat.messages,
          { role: 'user', content: message, timestamp: new Date() },
          response.data.response
        ]
      }));
      
      // Store relevant docs if any
      if (response.data.relevantDocs && response.data.relevantDocs.length > 0) {
        setRelevantDocs(response.data.relevantDocs);
      }
      
      // Clear message input
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Save chat settings
  const handleSaveSettings = async () => {
    try {
      await chatApi.updateChat(id, {
        title: chatTitle,
        model: selectedModel,
        useRAG
      });

      // Update local state
      setChat(prevChat => ({
        ...prevChat,
        title: chatTitle,
        model: selectedModel,
        useRAG
      }));

      setShowSettings(false);
    } catch (err) {
      console.error('Error updating chat settings:', err);
      setError('Failed to update settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
        <button
          onClick={() => navigate('/chat')}
          className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
        >
          <FaArrowLeft className="mr-1" /> Back to Chats
        </button>
      </div>
    );
  }

  if (!chat) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/chat')}
            className="mr-2 p-2 rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white"
          >
            <FaArrowLeft />
          </button>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white truncate">{chat.title}</h2>
        </div>
        <div className="flex items-center">
          {chat.useRAG && relevantDocs.length > 0 && (
            <button
              onClick={() => setShowRelevantDocs(!showRelevantDocs)}
              className="mr-2 p-2 rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white relative"
            >
              <FaInfoCircle />
              <span className="absolute top-0 right-0 h-2 w-2 bg-primary-600 rounded-full"></span>
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white"
          >
            <FaCog />
          </button>
        </div>
      </div>

      {/* Chat settings modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Chat Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chat Title</label>
                <input
                  type="text"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {models.length > 0 ? (
                    models.map((model) => (
                      <option key={model.name} value={model.name}>
                        {model.name}
                      </option>
                    ))
                  ) : (
                    <option value="deepseek-coder:latest">deepseek-coder:latest</option>
                  )}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  id="useRAG"
                  type="checkbox"
                  checked={useRAG}
                  onChange={() => setUseRAG(!useRAG)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="useRAG" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable RAG (Retrieval Augmented Generation)
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Relevant documents sidebar */}
      {showRelevantDocs && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto z-40">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Relevant Documents</h3>
            <button
              onClick={() => setShowRelevantDocs(false)}
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-white"
            >
              &times;
            </button>
          </div>
          <div className="p-4">
            {relevantDocs.map((doc, index) => (
              <div key={index} className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.metadata?.filename || 'Document'}</div>
                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{doc.content}</div>
                <div className="mt-1 text-xs text-gray-400">
                  Similarity: {(doc.similarity * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start a conversation by sending a message.</p>
          </div>
        ) : (
          chat.messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isUser={msg.role === 'user' || msg.role === 'human'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
            placeholder="Type your message..."
            className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            disabled={!message.trim() || sending}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !message.trim() || sending
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700'
            } focus:outline-none`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDetailPage; 