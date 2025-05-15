import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaComments, FaTrash } from 'react-icons/fa';
import { chatApi } from '../utils/api';

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatApi.getAllChats();
      setChats(response.data.chats || []);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const response = await chatApi.createChat({
        title: `New Chat ${new Date().toLocaleTimeString()}`,
        useRAG: true
      });
      
      window.location.href = `/chat/${response.data.chat.id}`;
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create chat. Please try again.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await chatApi.deleteChat(chatId);
      setChats(chats.filter(chat => chat._id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat. Please try again.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chats</h1>
        <button
          onClick={handleCreateChat}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
        >
          <FaPlus className="mr-2" /> New Chat
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-12">
          <FaComments className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No chats yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new chat.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateChat}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
            >
              <FaPlus className="mr-2" /> New Chat
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white truncate">
                  {chat.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(chat.updatedAt)}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  Model: {chat.model}
                </p>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                  RAG: {chat.useRAG ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6 flex justify-between">
                <Link
                  to={`/chat/${chat._id}`}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-100 dark:bg-primary-800 dark:hover:bg-primary-700"
                >
                  View Chat
                </Link>
                <button
                  onClick={() => handleDeleteChat(chat._id)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:text-red-100 dark:bg-red-800 dark:hover:bg-red-700"
                >
                  <FaTrash className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatPage; 