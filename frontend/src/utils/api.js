import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// File API endpoints
export const fileApi = {
  // Upload a file
  uploadFile: (formData) => {
    return api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Get all files
  getAllFiles: () => {
    return api.get('/files');
  },
  
  // Get file by ID
  getFileById: (fileId) => {
    return api.get(`/files/${fileId}`);
  },
  
  // Delete file
  deleteFile: (fileId) => {
    return api.delete(`/files/${fileId}`);
  },
  
  // Get file content
  getFileContent: (fileId) => {
    return api.get(`/files/${fileId}/content`);
  },
  
  // Search files
  searchFiles: (query) => {
    return api.get(`/files/search?query=${encodeURIComponent(query)}`);
  }
};

// Chat API endpoints
export const chatApi = {
  // Get all chats
  getAllChats: () => {
    return api.get('/chat');
  },
  
  // Get available models
  getModels: () => {
    return api.get('/chat/models');
  },
  
  // Create a new chat
  createChat: (chatData) => {
    return api.post('/chat', chatData);
  },
  
  // Get chat by ID
  getChatById: (chatId) => {
    return api.get(`/chat/${chatId}`);
  },
  
  // Update chat settings
  updateChat: (chatId, chatData) => {
    return api.put(`/chat/${chatId}`, chatData);
  },
  
  // Delete chat
  deleteChat: (chatId) => {
    return api.delete(`/chat/${chatId}`);
  },
  
  // Send a message
  sendMessage: (chatId, message, options = {}) => {
    return api.post(`/chat/${chatId}/messages`, { message, options });
  }
};

export default api; 