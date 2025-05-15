/**
 * LLM Client for Ollama
 * This utility provides functionality to interact with Ollama for text generation
 */
const fetch = require('node-fetch');

class OllamaClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:11434';
    this.model = options.model || 'deepseek-r1';
    this.defaultParams = {
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1024,
      top_p: options.topP || 0.9,
      stream: false
    };
  }

  /**
   * Generate a response from the LLM
   * @param {string} prompt - The prompt to send to the model
   * @param {Object} options - Additional parameters to pass to the model
   * @returns {Promise<string>} - The generated text
   */
  async generate(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          ...this.defaultParams,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error generating text with Ollama:', error);
      throw error;
    }
  }

  /**
   * Generate a chat completion with context
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional parameters to pass to the model
   * @returns {Promise<string>} - The generated response
   */
  async chat(messages, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          ...this.defaultParams,
          ...options
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.message || data.response;
    } catch (error) {
      console.error('Error generating chat response with Ollama:', error);
      throw error;
    }
  }

  /**
   * Get a list of available models
   * @returns {Promise<Array>} - List of available models
   */
  async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ollama API error: ${errorData.error || response.statusText}`);
      }
      
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error fetching models from Ollama:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const ollamaClient = new OllamaClient({
  baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  model: process.env.OLLAMA_MODEL || 'deepseek-r1',
  temperature: process.env.OLLAMA_TEMPERATURE || 0.7,
  maxTokens: process.env.OLLAMA_MAX_TOKENS || 2048
});

module.exports = ollamaClient; 