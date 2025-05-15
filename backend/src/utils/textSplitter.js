const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter')
const CHUNK_SIZE = process.env.CHUNK_SIZE || 1000
const CHUNK_OVERLAP = process.env.CHUNK_OVERLAP || 200

const splitText = async (text) => {
  try {
    const text_splitter = new RecursiveCharacterTextSplitter(
      {
        chunkSize: parseInt(CHUNK_SIZE),
        chunkOverlap: parseInt(CHUNK_OVERLAP)
      }
    )

    const chunks = await text_splitter.splitText(text)

    const cleanedChunks = chunks.map(chunk => chunk.replace(/^\s+|\s+$/g, '').replace(/\n+/g, ' '))

    return cleanedChunks
  } catch (error) {
    console.error('Error splitting text:', error)
    throw error
  }
}

module.exports = {
  splitText
}