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
   * Generate a RAG response by:
   * 1. Retrieving relevant documents from the vector database
   * 2. Creating a context-enhanced prompt
   * 3. Generating a response using the LLM
   * 
   * @param {string} query - User query
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} - Response with generated text and relevant documents
   */
  async generateResponse(query, options = {}) {
    try {
      // Get relevant documents from vector DB
      const results = await this.vectorDB.search(query, options.maxResults || 3);

      // Extract relevant context
      let context = '';
      const relevantDocs = [];

      if (results && results.length > 0) {
        context = results.map((doc, index) => {
          relevantDocs.push({
            id: doc.id,
            content: doc.content.substring(0, 200) + '...',
            metadata: doc.metadata,
            similarity: doc.similarity
          });

          return `Document ${index + 1}:\n${doc.content}`;
        }).join('\n\n');
      }

      // Build prompt with context
      const prompt = this._buildPromptWithContext(query, context);

      // Generate response using LLM
      const response = await this.llmClient.generate(prompt, {
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1024
      });

      return {
        query,
        response,
        relevantDocs
      };
    } catch (error) {
      console.error('Error in RAG service:', error);
      throw error;
    }
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

      if (results && results.length > 0) {
        const context = results.map((doc, index) => {
          relevantDocs.push({
            id: doc.id,
            content: doc.content.substring(0, 200) + '...',
            metadata: doc.metadata,
            similarity: doc.similarity
          });

          return `Document ${index + 1}:\n${doc.content}`;
        }).join('\n\n');

        contextMessage = {
          role: 'system',
          content: `You have access to the following relevant documents. Use them to provide accurate, factual answers to the user's question.

                    - Only output the final answer.
                    - Do not show your thought process.
                    - Do NOT include any reasoning, scratchpad, or tags such as <think>, <reasoning>, or similar.
                    - Do not use any tags or formatting except for the answer itself.
                    - Do NOT repeat or summarize the documents unless directly answering the question.
                    - If the answer is not found in the documents, say "I don't know based on the provided documents."

                    Relevant documents:
                    ${context}`
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


  /**
   * Build a prompt with context from retrieved documents
   * @private
   */
  _buildPromptWithContext(query, context) {
    const promptTemplate = `
You are a helpful assistant with access to the following documents:

${context || 'No relevant documents found.'}

Based on the above documents, please answer the following query:
${query}

If the documents don't contain relevant information to answer the query, say so and provide a general response.
`;

    return promptTemplate.trim();
  }
}

const removeThinkSection = (text) => {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}
// Export singleton
const ragService = new RAGService();
module.exports = ragService; 