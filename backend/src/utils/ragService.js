/**
 * Retrieval-Augmented Generation (RAG) Service
 * Combines vector database retrieval with LLM generation
 */
const vectorDB = require('./vectordb');
const ollamaClient = require('./llmClient');

class RAGService {
  constructor() {
    this.vectorDB = vectorDB;
    this.llmClient = ollamaClient;
  }


  /**
   * Enhanced chat with RAG
   * Integrates document context with chat history
   * 
   * @param {Array} messages - Chat history messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response object
   */
  async chat(messages, options = {}) {
    try {
      // Extract the latest user query
      const lastUserMessage = [...messages].reverse().find(msg =>
        msg.role === 'user' || msg.role === 'human'
      );

      if (!lastUserMessage) {
        throw new Error('No user message found in chat history');
      }

      const query = lastUserMessage.content;

      // Get relevant documents
      const results = await this.vectorDB.search(query, options.maxResults || 3);
      const relevantDocs = [];

      // Create a system message with context
      let contextMessage = null;

      // if (results && results.length > 0) {
      //   const context = results.map((doc, index) => {
      //     relevantDocs.push({
      //       id: doc.id,
      //       content: doc.content.substring(0, 200) + '...',
      //       metadata: doc.metadata,
      //       similarity: doc.similarity
      //     });

      //     return `Document ${doc.metadata?.filename}:\n---\n${doc.content.trim()}\n---`;
      //   }).join('\n\n');

      if (results && results.length > 0) {
        const context = results.map((doc, index) => {
          const filename = doc.metadata?.filename || `Document ${index + 1}`;
          const trimmedContent = doc.content.trim();

          // Push a summarized version to relevantDocs with content preview and metadata
          relevantDocs.push({
            id: doc.id,
            content: trimmedContent.slice(0, 300) + (trimmedContent.length > 300 ? '...' : ''),
            metadata: doc.metadata,
            similarity: doc.similarity
          });

          // Return clean document block with Markdown styling
          return `### Document: **${filename}**\n---\n**Content:**\n${trimmedContent}\n---`;
        }).join('\n\n');


        const promptTemplate = `
You are a helpful assistant. Answer the user's question only using the documents provided below.

Relevant Documents:
${context}

User Query:
${query}

Instructions:

- Be concise and factual.
      `.trim();


        contextMessage = {
          role: 'system',
          content: promptTemplate
        };

      }

      // Prepare messages for the chat
      const enhancedMessages = contextMessage ?
        [contextMessage, ...messages] :
        messages;

      // Generate chat response
      const response = await this.llmClient.chat(enhancedMessages, {
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024
      });

      let contentOnly = response.content;
      //If content starts with <think> remove it
      if (contentOnly.startsWith('<think>')) {
        contentOnly = removeThinkSection(contentOnly);
      }

      return {
        query,
        response: contentOnly || response,
        relevantDocs
      };
    } catch (error) {
      console.error('Error in RAG chat:', error);
      throw error;
    }
  }
}

const removeThinkSection = (text) => {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
// Export singleton
const ragService = new RAGService();
module.exports = ragService;