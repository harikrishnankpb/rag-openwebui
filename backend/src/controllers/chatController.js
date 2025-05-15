const Chat = require('../models/chat');
const ragService = require('../utils/ragService');
const ollamaClient = require('../utils/llmClient');

/**
 * Get all chats
 */
exports.getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find()
      .select('_id title model useRAG createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ error: 'Failed to retrieve chats' });
  }
};

/**
 * Get chat by ID
 */
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    res.status(200).json({ chat });
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ error: 'Failed to retrieve chat' });
  }
};

/**
 * Create a new chat
 */
exports.createChat = async (req, res) => {
  try {
    const { title, model, useRAG = true } = req.body;
    
    const chat = new Chat({
      title,
      model: model || 'deepseek-coder:latest',
      useRAG,
      messages: []
    });
    
    await chat.save();
    
    res.status(201).json({ 
      message: 'Chat created successfully',
      chat: {
        id: chat._id,
        title: chat.title,
        model: chat.model,
        useRAG: chat.useRAG
      }
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

/**
 * Update chat settings
 */
exports.updateChat = async (req, res) => {
  try {
    const { title, model, useRAG } = req.body;
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    if (title !== undefined) chat.title = title;
    if (model !== undefined) chat.model = model;
    if (useRAG !== undefined) chat.useRAG = useRAG;
    
    await chat.save();
    
    res.status(200).json({ 
      message: 'Chat updated successfully',
      chat: {
        id: chat._id,
        title: chat.title,
        model: chat.model,
        useRAG: chat.useRAG
      }
    });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
};

/**
 * Delete chat
 */
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    await Chat.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
};

/**
 * Add message to chat and get AI response
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, options = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    chat.messages.push(userMessage);
    
    // Format messages for the AI
    const formattedMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Generate AI response
    let aiResponse;
    let relevantDocs = [];
    
    if (chat.useRAG) {
      // Use RAG service
      const result = await ragService.chat(formattedMessages, {
        ...options,
        temperature: options.temperature || 0.7,
        maxTokens: options.maxTokens || 1024,
        maxResults: options.maxResults || 3,
        model: chat.model
      });
      
      aiResponse = result.response;
      relevantDocs = result.relevantDocs;
    } else {
      // Use direct LLM
      const customOptions = {
        ...options,
        model: chat.model
      };
      
      const result = await ollamaClient.chat(formattedMessages, customOptions);
      aiResponse = result.content || result;
    }
    
    // Add AI response to chat
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };
    
    chat.messages.push(assistantMessage);
    await chat.save();
    
    res.status(200).json({
      message: 'Message sent successfully',
      response: assistantMessage,
      relevantDocs
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Get available models from Ollama
 */
exports.getModels = async (req, res) => {
  try {
    const models = await ollamaClient.listModels();
    res.status(200).json({ models });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({ error: 'Failed to retrieve models' });
  }
}; 