/**
 * Vector Database Utility using ChromaDB
 * 
 * This file provides functions for integrating ChromaDB as a vector database.
 */
const { ChromaClient, Collection } = require('chromadb');
const config = require('../config/config');

class ChromaDBClient {
  constructor(options = {}) {
    this.isConnected = false;
    this.options = options;
    this.client = new ChromaClient({
      path: options.path || 'http://localhost:8000'
    });
    this.collection = null;
    this.collectionName = options.collectionName || 'documents';
  }

  /**
   * Connect to Chroma database and get or create collection
   */
  async connect() {
    try {
      // Check if collection exists, if not create it
      this.collection = await this.client.getOrCreateCollection({
        name: this.collectionName,
        metadata: { description: "Document storage for RAG application" }
      });
      
      this.isConnected = true;
      console.log(`ChromaDB connected, collection: ${this.collectionName}`);
      return true;
    } catch (error) {
      console.error('Error connecting to ChromaDB:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Store text data as vectors
   * @param {string} id - Document ID
   * @param {string} text - Text content to vectorize
   * @param {Object} metadata - Optional metadata
   */
  async storeVector(id, text, metadata = {}) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      await this.collection.add({
        ids: [id],
        documents: [text],
        metadatas: [metadata]
      });
      
      console.log(`Stored vector for document ${id} in ChromaDB`);
      return { id, status: 'success' };
    } catch (error) {
      console.error('Error storing vector:', error);
      throw error;
    }
  }

  /**
   * Search for similar vectors
   * @param {string} text - Query text to search
   * @param {number} limit - Maximum number of results
   * @returns {Array} Array of similar documents with metadata
   */
  async search(text, limit = 5) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      const results = await this.collection.query({
        queryTexts: [text],
        nResults: limit
      });
      
      // Format results for easier consumption
      if (results && results.documents && results.documents.length > 0) {
        const documents = results.documents[0] || [];
        const ids = results.ids[0] || [];
        const metadatas = results.metadatas[0] || [];
        const distances = results.distances ? results.distances[0] : [];
        
        return documents.map((doc, index) => ({
          id: ids[index],
          content: doc,
          metadata: metadatas[index],
          similarity: distances ? 1 - distances[index] : null
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching vectors:', error);
      throw error;
    }
  }

  /**
   * Delete a vector by ID
   * @param {string} id - Document ID to delete
   */
  async deleteVector(id) {
    if (!this.isConnected) {
      await this.connect();
    }
    
    try {
      await this.collection.delete({
        ids: [id]
      });
      
      console.log(`Deleted vector for document ${id} from ChromaDB`);
      return { id, status: 'success' };
    } catch (error) {
      console.error('Error deleting vector:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const vectorDBClient = new ChromaDBClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000',
  collectionName: process.env.CHROMA_COLLECTION || 'documents'
});

module.exports = vectorDBClient; 