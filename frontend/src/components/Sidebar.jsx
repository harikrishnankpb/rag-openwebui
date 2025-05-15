import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaComments, FaFile, FaPlus } from 'react-icons/fa';
import { chatApi } from '../utils/api';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all chats when the component mounts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await chatApi.getAllChats();
        setChats(response.data.chats || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  // Create a new chat
  const handleNewChat = async () => {
    try {
      const response = await chatApi.createChat({
        title: `New Chat ${new Date().toLocaleTimeString()}`,
        useRAG: true
      });
      
      // Add the new chat to the list
      setChats(prevChats => [response.data.chat, ...prevChats]);
      
      // Navigate to the new chat (you could use navigate from react-router-dom here)
      window.location.href = `/chat/${response.data.chat.id}`;
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10 transition-all duration-300">
      {/* Sidebar header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Navigation</h2>
      </div>
      
      {/* Sidebar content */}
      <nav className="mt-4 px-2">
        {/* New Chat button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
        >
          <FaPlus className="mr-2" />
          New Chat
        </button>
        
        {/* Navigation links */}
        <div className="mt-4 space-y-1">
          {/* Chats link */}
          <Link
            to="/chat"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md 
              ${location.pathname === '/chat' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <FaComments className="mr-3 h-5 w-5" />
            Chats
          </Link>
          
          {/* Files link */}
          <Link
            to="/files"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md 
              ${location.pathname === '/files' 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <FaFile className="mr-3 h-5 w-5" />
            Files
          </Link>
        </div>
        
        {/* Recent chats */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Recent Chats
          </h3>
          <div className="mt-2 space-y-1">
            {loading ? (
              <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Loading...</p>
            ) : chats.length === 0 ? (
              <p className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No chats yet</p>
            ) : (
              chats.slice(0, 5).map(chat => (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md truncate
                    ${location.pathname === `/chat/${chat._id}` 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                >
                  <FaComments className="mr-3 h-4 w-4 text-gray-500" />
                  {chat.title}
                </Link>
              ))
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar; 