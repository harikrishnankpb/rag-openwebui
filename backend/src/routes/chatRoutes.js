const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Get all chats
router.get('/', chatController.getAllChats);

// Get available models
router.get('/models', chatController.getModels);

// Create a new chat
router.post('/', chatController.createChat);

// Get a specific chat by ID
router.get('/:id', chatController.getChatById);

// Update chat settings
router.put('/:id', chatController.updateChat);

// Delete a chat
router.delete('/:id', chatController.deleteChat);

// Send a message to a chat
router.post('/:id/messages', chatController.sendMessage);

module.exports = router; 